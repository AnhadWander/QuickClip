/**
 * lib/mockData.ts
 * Mock summary data for UI development and testing without API keys.
 * Returned automatically when NEXT_PUBLIC_USE_MOCK=true or no LLM keys are set.
 */

import type { SummaryResult } from "./types";

export const MOCK_SUMMARY_RESULT: SummaryResult = {
  videoTitle: "Introduction to Machine Learning – Stanford CS229",
  videoUrl: "https://www.youtube.com/watch?v=jGwO_UgTS7I",
  thumbnailUrl: "https://img.youtube.com/vi/jGwO_UgTS7I/hqdefault.jpg",
  summaryLength: "standard",
  overallSummary:
    "This lecture introduces the fundamental concepts of machine learning, covering supervised learning, unsupervised learning, and reinforcement learning. The instructor explains how machine learning algorithms learn from data to make predictions without being explicitly programmed. Key applications demonstrated include spam detection, medical diagnosis, and autonomous driving. The lecture emphasizes the importance of training data quality and the distinction between the training and test phases of a model.",
  keyPoints: [
    "Machine learning enables computers to learn from data without explicit programming",
    "Supervised learning uses labeled examples to train models for prediction tasks",
    "Unsupervised learning finds hidden patterns in unlabeled data",
    "Reinforcement learning trains agents through reward and penalty signals",
    "Training data quality directly determines model performance and generalization",
  ],
  timestamps: [
    {
      time: "00:00",
      label: "Course Introduction",
      description:
        "The instructor introduces the scope of the machine learning course and its prerequisites.",
    },
    {
      time: "03:45",
      label: "What is Machine Learning?",
      description:
        "Definition of machine learning as algorithms that improve from experience without being explicitly programmed.",
    },
    {
      time: "08:20",
      label: "Supervised Learning",
      description:
        "Explanation of supervised learning with examples including housing price prediction and spam classification.",
    },
    {
      time: "15:10",
      label: "Unsupervised Learning",
      description:
        "Overview of unsupervised learning and clustering algorithms applied to gene expression data.",
    },
    {
      time: "22:30",
      label: "Reinforcement Learning",
      description:
        "Introduction to reinforcement learning through the example of training a robot to walk.",
    },
  ],
  quiz: [
    {
      question:
        "According to the lecture, what is the primary characteristic that distinguishes machine learning from traditional programming?",
      options: [
        "Machine learning uses more computational resources",
        "ML algorithms improve from experience without explicit programming",
        "Machine learning only works with images and video",
        "Traditional programming cannot solve any real-world problems",
      ],
      correctAnswer:
        "ML algorithms improve from experience without explicit programming",
      explanation:
        "The instructor explicitly defined machine learning as 'algorithms that give computers the ability to learn from data without being explicitly programmed'.",
    },
    {
      question:
        "Which type of learning does the lecture associate with spam email detection?",
      options: [
        "Unsupervised learning",
        "Reinforcement learning",
        "Supervised learning",
        "Semi-supervised learning",
      ],
      correctAnswer: "Supervised learning",
      explanation:
        "Spam detection was listed as a supervised learning example because it uses labeled training data (spam vs. not spam).",
    },
    {
      question:
        "What does the lecture say about the relationship between training data and model performance?",
      options: [
        "Model performance is independent of training data",
        "Only the algorithm architecture matters",
        "Training data quality directly determines model performance",
        "More data always reduces accuracy",
      ],
      correctAnswer:
        "Training data quality directly determines model performance",
      explanation:
        "The instructor emphasized that the quality of training data is the most critical factor in how well a model generalizes.",
    },
    {
      question: "How does the lecture describe reinforcement learning?",
      options: [
        "Learning from a dataset of labeled images",
        "Clustering similar data points together",
        "Training agents through reward and penalty signals",
        "Predicting housing prices from historical data",
      ],
      correctAnswer: "Training agents through reward and penalty signals",
      explanation:
        "The lecture described reinforcement learning using the example of a robot learning to walk by receiving rewards for successful movements.",
    },
    {
      question:
        "Which example was used to illustrate unsupervised learning in this lecture?",
      options: [
        "Spam email classification",
        "Gene expression data clustering",
        "Housing price prediction",
        "Robot locomotion training",
      ],
      correctAnswer: "Gene expression data clustering",
      explanation:
        "The instructor specifically mentioned clustering of gene expression data as an example of unsupervised learning finding hidden patterns.",
    },
  ],
};
