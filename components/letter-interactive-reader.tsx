"use client";

import { useState } from "react";
import { LetterContentViewer } from "@/components/letter-content-viewer";
import { LetterPassageComments, CommentItem } from "@/components/letter-passage-comments";

interface LetterInteractiveReaderProps {
  letterId: string;
  processedText: string;
  rawText: string;
  isAuthor: boolean;
  maskContent: boolean;
  comments: CommentItem[];
  currentUserId: string;
  letterAuthorId: string;
  t: (key: string, values?: Record<string, string>) => string;
}

export function LetterInteractiveReader({
  letterId,
  processedText,
  rawText,
  isAuthor,
  maskContent,
  comments,
  currentUserId,
  letterAuthorId,
  t
}: LetterInteractiveReaderProps) {
  const [prefilledSelectedText, setPrefilledSelectedText] = useState("");

  const highlightedQuotes = comments
    .map((c) => c.selectedText)
    .filter(Boolean);

  const handleSelectPassage = (quote: string) => {
    setPrefilledSelectedText(quote);
  };

  return (
    <div>
      <LetterContentViewer
        processedText={processedText}
        rawText={rawText}
        isAuthor={isAuthor}
        maskContent={maskContent}
        highlightedQuotes={highlightedQuotes}
        onSelectPassage={handleSelectPassage}
        t={t}
      />

      {!maskContent && (
        <LetterPassageComments
          letterId={letterId}
          comments={comments}
          currentUserId={currentUserId}
          letterAuthorId={letterAuthorId}
          prefilledSelectedText={prefilledSelectedText}
          onClearPrefill={() => setPrefilledSelectedText("")}
          t={t}
        />
      )}
    </div>
  );
}
