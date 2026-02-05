#!/usr/bin/env python3
"""
LexVault Legal Document Pre-Processor

Extracts and chunks Swiss legal documents with awareness of legal structure:
- Article boundaries (Art., §)
- Paragraph markers (Abs., Ziff., lit.)
- Preserves legal citation context

Output: Clean text files ready for Verba ingestion.

Usage:
    python ingest_legal.py input.pdf
    python ingest_legal.py ./input_folder/
"""

import os
import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Generator

try:
    from pypdf import PdfReader
except ImportError:
    print("Installing pypdf...")
    os.system("pip install pypdf")
    from pypdf import PdfReader


@dataclass
class LegalChunk:
    """A semantically meaningful chunk of legal text."""
    content: str
    source_file: str
    page_numbers: list[int]
    article_ref: str | None = None  # e.g., "Art. 123"
    

# Swiss legal structure patterns
ARTICLE_PATTERN = re.compile(
    r'^(Art\.?\s*\d+[a-z]?|§\s*\d+|Artikel\s+\d+)',
    re.MULTILINE | re.IGNORECASE
)
PARAGRAPH_PATTERN = re.compile(
    r'^(Abs\.?\s*\d+|Ziff\.?\s*\d+|lit\.?\s*[a-z]|\d+\.\s)',
    re.MULTILINE
)
# Section headers in Swiss legal docs
SECTION_PATTERN = re.compile(
    r'^(Abschnitt|Kapitel|Teil|Titel|Section)\s+[\dIVX]+',
    re.MULTILINE | re.IGNORECASE
)


def extract_text_from_pdf(pdf_path: Path) -> Generator[tuple[int, str], None, None]:
    """Extract text page by page from PDF."""
    reader = PdfReader(pdf_path)
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        yield i + 1, text


def clean_legal_text(text: str) -> str:
    """Clean extracted text while preserving legal structure."""
    # Normalize whitespace but preserve paragraph breaks
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Fix common PDF extraction issues
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)  # Rejoin hyphenated words
    text = re.sub(r'(?<=[a-z])\n(?=[a-z])', ' ', text)  # Join mid-sentence breaks
    
    return text.strip()


def find_article_boundaries(text: str) -> list[tuple[int, str]]:
    """Find positions of article boundaries in text."""
    boundaries = []
    for match in ARTICLE_PATTERN.finditer(text):
        boundaries.append((match.start(), match.group(1)))
    return boundaries


def chunk_legal_document(
    full_text: str,
    source_file: str,
    page_numbers: list[int],
    max_chunk_size: int = 1500,
    overlap: int = 100
) -> list[LegalChunk]:
    """
    Chunk legal text with awareness of article boundaries.
    
    Strategy:
    1. First, try to split on Article boundaries
    2. If chunks are too large, split on paragraph markers
    3. Fall back to sentence boundaries if needed
    """
    chunks = []
    article_boundaries = find_article_boundaries(full_text)
    
    if not article_boundaries:
        # No articles found - fall back to size-based chunking
        return _size_based_chunking(full_text, source_file, page_numbers, max_chunk_size, overlap)
    
    # Add end position
    article_boundaries.append((len(full_text), None))
    
    for i in range(len(article_boundaries) - 1):
        start_pos, article_ref = article_boundaries[i]
        end_pos = article_boundaries[i + 1][0]
        
        chunk_text = full_text[start_pos:end_pos].strip()
        
        if len(chunk_text) <= max_chunk_size:
            chunks.append(LegalChunk(
                content=chunk_text,
                source_file=source_file,
                page_numbers=page_numbers,
                article_ref=article_ref
            ))
        else:
            # Article too long - split on paragraphs
            sub_chunks = _split_on_paragraphs(chunk_text, article_ref, source_file, page_numbers, max_chunk_size)
            chunks.extend(sub_chunks)
    
    return chunks


def _split_on_paragraphs(
    text: str,
    article_ref: str | None,
    source_file: str,
    page_numbers: list[int],
    max_chunk_size: int
) -> list[LegalChunk]:
    """Split text on paragraph markers (Abs., Ziff., etc.)."""
    chunks = []
    
    # Find paragraph boundaries
    para_matches = list(PARAGRAPH_PATTERN.finditer(text))
    
    if not para_matches:
        # No paragraphs - do size-based split
        return _size_based_chunking(text, source_file, page_numbers, max_chunk_size, 100, article_ref)
    
    positions = [0] + [m.start() for m in para_matches] + [len(text)]
    
    current_chunk = ""
    for i in range(len(positions) - 1):
        segment = text[positions[i]:positions[i + 1]]
        
        if len(current_chunk) + len(segment) <= max_chunk_size:
            current_chunk += segment
        else:
            if current_chunk:
                chunks.append(LegalChunk(
                    content=current_chunk.strip(),
                    source_file=source_file,
                    page_numbers=page_numbers,
                    article_ref=article_ref
                ))
            current_chunk = segment
    
    if current_chunk.strip():
        chunks.append(LegalChunk(
            content=current_chunk.strip(),
            source_file=source_file,
            page_numbers=page_numbers,
            article_ref=article_ref
        ))
    
    return chunks


def _size_based_chunking(
    text: str,
    source_file: str,
    page_numbers: list[int],
    max_chunk_size: int,
    overlap: int,
    article_ref: str | None = None
) -> list[LegalChunk]:
    """Fall back to size-based chunking with overlap."""
    chunks = []
    
    # Try to split on sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 1 <= max_chunk_size:
            current_chunk += (" " if current_chunk else "") + sentence
        else:
            if current_chunk:
                chunks.append(LegalChunk(
                    content=current_chunk.strip(),
                    source_file=source_file,
                    page_numbers=page_numbers,
                    article_ref=article_ref
                ))
            # Start new chunk with overlap from previous
            if overlap and current_chunk:
                overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                current_chunk = overlap_text + " " + sentence
            else:
                current_chunk = sentence
    
    if current_chunk.strip():
        chunks.append(LegalChunk(
            content=current_chunk.strip(),
            source_file=source_file,
            page_numbers=page_numbers,
            article_ref=article_ref
        ))
    
    return chunks


def process_pdf(pdf_path: Path, output_dir: Path) -> list[LegalChunk]:
    """Process a single PDF file."""
    print(f"Processing: {pdf_path.name}")
    
    # Extract all text with page tracking
    full_text = ""
    page_numbers = []
    
    for page_num, page_text in extract_text_from_pdf(pdf_path):
        page_numbers.append(page_num)
        full_text += f"\n{page_text}"
    
    # Clean and chunk
    cleaned_text = clean_legal_text(full_text)
    chunks = chunk_legal_document(cleaned_text, pdf_path.name, page_numbers)
    
    # Write chunks to output
    output_file = output_dir / f"{pdf_path.stem}_chunks.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        for i, chunk in enumerate(chunks):
            f.write(f"--- CHUNK {i+1} ---\n")
            if chunk.article_ref:
                f.write(f"[{chunk.article_ref}]\n")
            f.write(f"{chunk.content}\n\n")
    
    print(f"  → {len(chunks)} chunks → {output_file.name}")
    return chunks


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    script_dir = Path(__file__).parent.parent
    output_dir = script_dir / "data" / "processed"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if input_path.is_file() and input_path.suffix.lower() == '.pdf':
        process_pdf(input_path, output_dir)
    elif input_path.is_dir():
        pdfs = list(input_path.glob("*.pdf")) + list(input_path.glob("*.PDF"))
        if not pdfs:
            print(f"No PDF files found in {input_path}")
            sys.exit(1)
        for pdf in pdfs:
            process_pdf(pdf, output_dir)
    else:
        print(f"Invalid input: {input_path}")
        sys.exit(1)
    
    print(f"\nDone! Processed files are in: {output_dir}")
    print("You can now import them into Verba via the web UI at http://localhost:8000")


if __name__ == "__main__":
    main()
