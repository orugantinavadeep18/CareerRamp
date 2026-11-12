"""Train the lightweight career-role evidence model used by CareerRamp."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


FIRST_COLUMNS = {
    "course": "What was your course in UG?",
    "specialization": "What is your UG specialization? Major Subject (Eg; Mathematics)",
    "interests": "What are your interests?",
    "skills": "What are your skills ? (Select multiple if necessary)",
    "certifications": "If yes, please specify your certificate course title.",
    "masters": "Have you done masters after undergraduation? If yes, mention your field of masters.(Eg; Masters in Mathematics)",
    "label": "If yes, then what is/was your first Job title in your current field of work? If not applicable, write NA.               ",
}
SECOND_LABEL = "Suggested Job Role"


def clean(value: object) -> str:
    if pd.isna(value):
        return ""
    return re.sub(r"\s+", " ", str(value).replace("\ufffd", " ")).strip()


def valid_label(value: object) -> bool:
    return clean(value).lower() not in {"", "na", "n/a", "not applicable", "none", "nan"}


def first_text(row: pd.Series) -> str:
    return " ".join(
        f"{name}: {clean(row[column])}"
        for name, column in FIRST_COLUMNS.items()
        if name != "label"
    )


def second_text(row: pd.Series) -> str:
    return " ".join(
        f"{column}: {clean(row[column])}"
        for column in row.index
        if column != SECOND_LABEL
    )


def load_examples(first_path: Path, second_path: Path):
    first = pd.read_csv(first_path)
    second = pd.read_csv(second_path)
    first_texts, second_texts, second_labels = [], [], []
    sources = {"career_recommendation": 0, "student_career": 0}

    for _, row in first.iterrows():
        if valid_label(row[FIRST_COLUMNS["label"]]):
            first_texts.append(first_text(row))
            sources["career_recommendation"] += 1
    for _, row in second.iterrows():
        if valid_label(row[SECOND_LABEL]):
            second_texts.append(second_text(row))
            second_labels.append(clean(row[SECOND_LABEL]))
            sources["student_career"] += 1
    if not second_texts:
        raise ValueError("No labelled rows were found in the supplied datasets")
    return first_texts, second_texts, second_labels, sources


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--first", required=True, type=Path)
    parser.add_argument("--second", required=True, type=Path)
    parser.add_argument("--output", default=Path("backend/ml/career_model.json"), type=Path)
    args = parser.parse_args()

    first_texts, second_texts, labels, sources = load_examples(args.first, args.second)
    texts = first_texts + second_texts
    vectorizer = TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z0-9+#.]{1,}\b",
        ngram_range=(1, 2),
        min_df=2,
        max_features=8000,
        sublinear_tf=True,
    )
    vectorizer.fit(texts)
    matrix = vectorizer.transform(second_texts)
    class_names = sorted(set(labels))
    label_to_index = {label: index for index, label in enumerate(class_names)}
    numeric_labels = [label_to_index[label] for label in labels]
    train_indices, test_indices = train_test_split(
        range(len(labels)), test_size=0.2, random_state=42, stratify=numeric_labels
    )
    classifier = LogisticRegression(max_iter=500, C=2, solver="lbfgs")
    classifier.fit(matrix[train_indices], [numeric_labels[index] for index in train_indices])

    eval_labels = [numeric_labels[index] for index in test_indices]
    probabilities = classifier.predict_proba(matrix[test_indices])
    predictions = probabilities.argmax(axis=1)
    top_five = [
        actual in row.argsort()[-5:]
        for actual, row in zip(eval_labels, probabilities)
    ]

    model = {
        "version": 1,
        "algorithm": "tfidf-logistic-regression",
        "sources": sources,
        "evaluation": {
            "dataset": "Student Career Dataset",
            "rows": len(eval_labels),
            "accuracy": round(float(accuracy_score(eval_labels, predictions)), 4),
            "top5Accuracy": round(float(sum(top_five) / len(top_five)), 4),
        },
        "vectorizer": {
            "vocabulary": {key: int(value) for key, value in vectorizer.vocabulary_.items()},
            "idf": [round(float(value), 8) for value in vectorizer.idf_],
        },
        "classes": class_names,
        "coefficients": [[round(float(value), 8) for value in row] for row in classifier.coef_],
        "intercepts": [round(float(value), 8) for value in classifier.intercept_],
        "support": [numeric_labels.count(index) for index in range(len(class_names))],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(model, separators=(",", ":")), encoding="utf-8")
    print(json.dumps(model["evaluation"]))
    print(json.dumps({"trainingRows": len(texts), "labelledRows": len(labels), "classes": len(class_names), "sources": sources}))


if __name__ == "__main__":
    main()
