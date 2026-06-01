from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


OUT_DIR = Path(__file__).resolve().parent / "figures"
OUT_DIR.mkdir(exist_ok=True)

plt.rcParams.update(
    {
        "figure.dpi": 180,
        "savefig.dpi": 180,
        "font.family": "DejaVu Sans",
        "axes.titleweight": "bold",
        "axes.edgecolor": "#111827",
        "axes.labelcolor": "#111827",
        "xtick.color": "#374151",
        "ytick.color": "#374151",
        "text.color": "#111827",
    }
)

COLORS = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2"]
NEUTRAL = "#e5e7eb"


def save(fig, filename):
    fig.tight_layout()
    fig.savefig(OUT_DIR / filename, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def barh(title, labels, values, filename, xlabel="Participants", color="#2563eb"):
    fig, ax = plt.subplots(figsize=(8.6, 4.4))
    y = np.arange(len(labels))
    bars = ax.barh(y, values, color=color, edgecolor="#111827", linewidth=0.8)
    ax.set_yticks(y, labels)
    ax.invert_yaxis()
    ax.set_xlabel(xlabel)
    ax.set_title(title, loc="left", fontsize=14, pad=12)
    ax.grid(axis="x", color="#d1d5db", linewidth=0.7, alpha=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    for bar, value in zip(bars, values):
        ax.text(
            value + 0.18,
            bar.get_y() + bar.get_height() / 2,
            f"{value} ({value / 15:.0%})",
            va="center",
            fontsize=9,
            fontweight="bold",
        )
    ax.set_xlim(0, max(values) + 2.2)
    save(fig, filename)


def donut(title, labels, values, filename):
    fig, ax = plt.subplots(figsize=(6.8, 4.8))
    wedges, _ = ax.pie(
        values,
        colors=COLORS[: len(values)],
        startangle=90,
        counterclock=False,
        wedgeprops={"width": 0.42, "edgecolor": "white", "linewidth": 2},
    )
    ax.set_title(title, loc="left", fontsize=14, pad=12)
    total = sum(values)
    legend_labels = [f"{label}: {value} ({value / total:.0%})" for label, value in zip(labels, values)]
    ax.legend(
        wedges,
        legend_labels,
        loc="center left",
        bbox_to_anchor=(0.92, 0.5),
        frameon=False,
        fontsize=9,
    )
    ax.text(0, 0, f"N={total}", ha="center", va="center", fontsize=14, fontweight="bold")
    save(fig, filename)


def likert_overload():
    labels = ["1-2 Not tiring", "3 Neutral", "4-5 Tiring"]
    values = [1, 3, 11]
    fig, ax = plt.subplots(figsize=(8.6, 3.2))
    left = 0
    for label, value, color in zip(labels, values, ["#16a34a", "#f97316", "#dc2626"]):
        ax.barh(["Information overload"], [value], left=left, color=color, edgecolor="#111827", linewidth=0.8, label=label)
        ax.text(left + value / 2, 0, f"{value}\n{value / 15:.0%}", ha="center", va="center", color="white", fontweight="bold")
        left += value
    ax.set_xlim(0, 15)
    ax.set_title("Information Overload Rating", loc="left", fontsize=14, pad=12)
    ax.set_xlabel("Participants")
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.24), ncol=3, frameon=False)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_visible(False)
    ax.grid(axis="x", color="#d1d5db", linewidth=0.7, alpha=0.8)
    save(fig, "information_overload.png")


def feature_support():
    features = [
        "Customizable layout",
        "AI summaries",
        "Serendipity section",
        "Commentary while sharing",
        "Personal newspaper interest",
    ]
    values = [13, 11, 13, 12, 13]
    fig, ax = plt.subplots(figsize=(8.6, 4.7))
    y = np.arange(len(features))
    bars = ax.barh(y, values, color=["#2563eb", "#16a34a", "#f97316", "#9333ea", "#0891b2"], edgecolor="#111827", linewidth=0.8)
    ax.set_yticks(y, features)
    ax.invert_yaxis()
    ax.set_xlim(0, 15)
    ax.set_xlabel("Positive / interested responses out of 15")
    ax.set_title("Support for Proposed Kişisel Features", loc="left", fontsize=14, pad=12)
    ax.grid(axis="x", color="#d1d5db", linewidth=0.7, alpha=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    for bar, value in zip(bars, values):
        ax.text(value + 0.15, bar.get_y() + bar.get_height() / 2, f"{value} ({value / 15:.0%})", va="center", fontsize=9, fontweight="bold")
    save(fig, "feature_support.png")


def main():
    donut("Age Distribution", ["18-24", "25-34"], [13, 2], "age_distribution.png")
    barh(
        "News Platforms Used",
        ["Social media", "News aggregators", "Direct news sites"],
        [14, 7, 3],
        "platforms_used.png",
        color="#2563eb",
    )
    donut("Preferred Reading Depth", ["Headline mode", "Summary mode", "Full context mode"], [8, 6, 1], "reading_depth.png")
    likert_overload()
    barh(
        "Largest Problems in Current News Platforms",
        ["Same topics / viewpoints", "Clickbait content", "Forced irrelevant content"],
        [6, 5, 4],
        "largest_problems.png",
        color="#f97316",
    )
    donut("Perceived Filter Bubble", ["Yes", "No", "Not sure"], [12, 2, 1], "filter_bubble.png")
    feature_support()
    donut("Personal Newspaper Concept", ["Would create/share", "Would read/follow", "Not interested"], [4, 9, 2], "personal_newspaper.png")


if __name__ == "__main__":
    main()
