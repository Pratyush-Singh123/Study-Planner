/**
 * Realistic Demo Dataset for GapFill
 * Allows judges and testers to immediately explore the system with realistic CS data
 */

export const DEMO_DATASET = {
  llm_config: {
    provider: "demo",
    apiKey: "",
    model: "claude-3-5-sonnet-20241022",
    ollamaEndpoint: "http://localhost:11434"
  },
  subjects: [
    {
      id: "cs-dsa-101",
      name: "Data Structures & Algorithms",
      code: "CS201",
      examDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from today
      difficulty: "Hard",
      prepLevel: "Partial",
      targetScore: 90
    },
    {
      id: "cs-os-102",
      name: "Operating Systems",
      code: "CS204",
      examDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from today
      difficulty: "Medium",
      prepLevel: "Not started",
      targetScore: 85
    }
  ],
  rawSyllabus: {
    "cs-dsa-101": `Unit 1: Linear Data Structures - Dynamic Arrays, Singly & Doubly Linked Lists, Memory layouts, Pointer operations.
Unit 2: Stacks & Queues - LIFO/FIFO abstractions, Infix to Postfix conversions, Circular Queue implementations.
Unit 3: Trees & Traversals - Binary Search Trees, Inorder/Preorder/Postorder traversals, Height-balanced trees, AVL tree rotations (LL, RR, LR, RL).
Unit 4: Non-Linear Structures - Graphs, Representation (Adjacency List/Matrix), BFS, DFS, Cycle Detection, Topological Sort.
Unit 5: Hashing & Heaps - Hash tables, Collision resolution (Chaining, Linear Probing), Binary Heaps, Priority Queues.`
  },
  schedule: {
    hoursPerDay: 4,
    blockedDates: [],
    sessionLength: 45
  },
  topics: {
    "cs-dsa-101": [
      {
        id: "t1",
        name: "Arrays & Dynamic Sizing",
        description: "Contiguous memory allocation, time complexity of access and resizing amortized analysis.",
        difficulty: "Easy",
        estimatedHours: 1,
        prerequisites: [],
        status: "mastered"
      },
      {
        id: "t2",
        name: "Singly & Doubly Linked Lists",
        description: "Node structures, pointer manipulations, in-place reversal, and cycle detection.",
        difficulty: "Medium",
        estimatedHours: 2,
        prerequisites: ["Arrays & Dynamic Sizing"],
        status: "in_progress"
      },
      {
        id: "t3",
        name: "Stacks & Circular Queues",
        description: "LIFO/FIFO mechanisms, arithmetic expression parsing, array-based circular buffers.",
        difficulty: "Medium",
        estimatedHours: 2,
        prerequisites: ["Arrays & Dynamic Sizing"],
        status: "in_progress"
      },
      {
        id: "t4",
        name: "BST & Tree Traversals",
        description: "Recursive and iterative traversals (DFS/BFS), binary search tree invariants.",
        difficulty: "Medium",
        estimatedHours: 2,
        prerequisites: ["Singly & Doubly Linked Lists"],
        status: "in_progress"
      },
      {
        id: "t5",
        name: "AVL Trees & Balance Rotations",
        description: "Balance factors, single (LL, RR) and double (LR, RL) rotations for rebalancing.",
        difficulty: "Hard",
        estimatedHours: 3,
        prerequisites: ["BST & Tree Traversals"],
        status: "not_started"
      },
      {
        id: "t6",
        name: "Graph Traversals (BFS & DFS)",
        description: "Graph representation, queue-based BFS, recursion-based DFS, cycle detection.",
        difficulty: "Hard",
        estimatedHours: 3,
        prerequisites: ["Stacks & Circular Queues", "BST & Tree Traversals"],
        status: "in_progress"
      },
      {
        id: "t7",
        name: "Hash Tables & Collision Resolution",
        description: "Hash functions, separate chaining, open addressing (linear & quadratic probing).",
        difficulty: "Medium",
        estimatedHours: 2,
        prerequisites: ["Arrays & Dynamic Sizing"],
        status: "mastered"
      }
    ]
  },
  pyqs: {
    "cs-dsa-101": [
      { id: "p1", question: "Explain with diagrams the single vs double rotations in AVL trees when inserting an element into the left subtree of the right child.", topic: "AVL Trees & Balance Rotations", marks: 10, year: 2024 },
      { id: "p2", question: "Given an unsorted singly linked list, reverse it in-place using O(1) auxiliary memory. Trace pointer movements.", topic: "Singly & Doubly Linked Lists", marks: 7, year: 2024 },
      { id: "p3", question: "Write algorithm for BFS traversal of a connected undirected graph using adjacency list.", topic: "Graph Traversals (BFS & DFS)", marks: 10, year: 2023 },
      { id: "p4", question: "Explain collision resolution using separate chaining vs linear probing with clustering comparison.", topic: "Hash Tables & Collision Resolution", marks: 5, year: 2023 },
      { id: "p5", question: "Insert elements [14, 17, 11, 7, 53, 4, 13] into an AVL tree. Indicate every balance factor calculation.", topic: "AVL Trees & Balance Rotations", marks: 10, year: 2022 },
      { id: "p6", question: "Implement a circular queue using an array. How are front and rear pointers updated?", topic: "Stacks & Circular Queues", marks: 6, year: 2022 },
      { id: "p7", question: "Detect a cycle in a directed graph using DFS and recursion stack tracking.", topic: "Graph Traversals (BFS & DFS)", marks: 8, year: 2021 },
      { id: "p8", question: "Prove that AVL tree height is bounded by O(log N).", topic: "AVL Trees & Balance Rotations", marks: 7, year: 2021 },
      { id: "p9", question: "Convert the infix expression (A + B) * (C - D) / E to postfix using an explicit stack trace.", topic: "Stacks & Circular Queues", marks: 5, year: 2020 },
      { id: "p10", question: "Write a recursive function to find the maximum depth of a binary tree.", topic: "BST & Tree Traversals", marks: 5, year: 2020 }
    ]
  },
  gapScores: {
    "AVL Trees & Balance Rotations": { score: 85, attempts: 4, lastAttempted: "2026-10-10T11:20:00Z" },
    "Graph Traversals (BFS & DFS)": { score: 62, attempts: 3, lastAttempted: "2026-10-09T16:45:00Z" },
    "Singly & Doubly Linked Lists": { score: 45, attempts: 5, lastAttempted: "2026-10-11T09:15:00Z" },
    "BST & Tree Traversals": { score: 38, attempts: 4, lastAttempted: "2026-10-08T14:10:00Z" },
    "Stacks & Circular Queues": { score: 30, attempts: 3, lastAttempted: "2026-10-07T12:00:00Z" },
    "Arrays & Dynamic Sizing": { score: 12, attempts: 6, lastAttempted: "2026-10-06T10:00:00Z" },
    "Hash Tables & Collision Resolution": { score: 18, attempts: 5, lastAttempted: "2026-10-08T18:30:00Z" }
  },
  mistakeLog: [
    {
      id: "m1",
      subject: "Data Structures & Algorithms",
      topic: "AVL Trees & Balance Rotations",
      question: "Which rotation is required for insertion into right subtree of left child?",
      studentAnswer: "Right rotation (LL)",
      conceptualError: "Confused LR double rotation with single right rotation (LL). Did not recognize the zigzag imbalance requiring a Left-Right double rotation.",
      errorCategory: "Mental Model Misconception",
      date: "2026-10-10",
      resolved: false
    },
    {
      id: "m2",
      subject: "Data Structures & Algorithms",
      topic: "Singly & Doubly Linked Lists",
      question: "In in-place reverse, what happens if head.next is not set to null?",
      studentAnswer: "The list just reverses backwards",
      conceptualError: "Failed to realize the original head becomes the new tail. Omitting `head.next = null` produces a cyclic self-reference and infinite loops during traversal.",
      errorCategory: "Edge Case Overlooked",
      date: "2026-10-11",
      resolved: false
    },
    {
      id: "m3",
      subject: "Data Structures & Algorithms",
      topic: "Graph Traversals (BFS & DFS)",
      question: "Why do we need a visited set in BFS for graphs with cycles?",
      studentAnswer: "To know the shortest path distance",
      conceptualError: "Conflated the termination mechanism (preventing infinite loops in cyclic graphs) with distance recording.",
      errorCategory: "Terminology Confusion",
      date: "2026-10-09",
      resolved: false
    }
  ],
  topicNotes: {
    "AVL Trees & Balance Rotations": `# AVL Tree Balance & Invariant Rules

### Core Invariant
For every node $v$ in an AVL tree, the balance factor $BF(v)$ must satisfy:
$$BF(v) = Height(LeftSubtree) - Height(RightSubtree) \\in \\{-1, 0, 1\\}$$

### Rotation Decision Matrix
| Insert Location | Imbalance Type | Rotation Sequence |
| :--- | :--- | :--- |
| Left subtree of Left child | **LL Case** | Single **Right Rotation** at node $z$ |
| Right subtree of Right child | **RR Case** | Single **Left Rotation** at node $z$ |
| Right subtree of Left child | **LR Case** | Double: Left on left child, then Right on $z$ |
| Left subtree of Right child | **RL Case** | Double: Right on right child, then Left on $z$ |

> ⚠️ **Common Exam Mistake:** For LR / RL rotations, the node that ends up at the root of the balanced subtree is the **grandchild** (middle key), NOT the child!

### Height Bound Proof Intuition
Minimum nodes in tree of height $h$:
$$N(h) = N(h-1) + N(h-2) + 1$$
This follows Fibonacci progression: $N(h) \\ge F_{h+2} - 1$, guaranteeing worst-case height $h < 1.44 \\log_2 N$.`,

    "Singly & Doubly Linked Lists": `# Linked List Reversal & Invariants

### 3-Pointer Reversal Invariant
At the start of each iteration:
- \`prev\` points to the already reversed prefix.
- \`curr\` points to the node currently being processed.
- \`next\` temporarily preserves the rest of the list.

\`\`\`c
Node* reverseList(Node* head) {
    Node *prev = NULL, *curr = head, *nxt = NULL;
    while (curr != NULL) {
        nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev; // New head
}
\`\`\`

> ⚠️ **Critical Trap:** If you forget \`curr->next = prev\` on the original head when \`prev == NULL\`, the initial head retains its link, producing an infinite cycle!`
  },
  studyActivity: {
    "2026-09-28": { minutes: 90, questions: 4, sessions: 2 },
    "2026-09-29": { minutes: 60, questions: 3, sessions: 1 },
    "2026-09-30": { minutes: 120, questions: 7, sessions: 3 },
    "2026-10-01": { minutes: 45, questions: 2, sessions: 1 },
    "2026-10-02": { minutes: 80, questions: 5, sessions: 2 },
    "2026-10-04": { minutes: 110, questions: 6, sessions: 2 },
    "2026-10-05": { minutes: 90, questions: 4, sessions: 2 },
    "2026-10-06": { minutes: 120, questions: 8, sessions: 3 },
    "2026-10-07": { minutes: 75, questions: 5, sessions: 2 },
    "2026-10-08": { minutes: 100, questions: 6, sessions: 2 },
    "2026-10-09": { minutes: 130, questions: 9, sessions: 3 },
    "2026-10-10": { minutes: 90, questions: 6, sessions: 2 },
    "2026-10-11": { minutes: 115, questions: 7, sessions: 3 }
  },
  mockExamHistory: [
    {
      id: "mock_01",
      subjectId: "cs-dsa-101",
      subjectName: "Data Structures & Algorithms",
      date: "2026-10-09",
      score: 39,
      totalMarks: 50,
      percentage: 78,
      grade: "A",
      durationMins: 52,
      summary: "Strong performance on Section A short answers. Lost marks on Section B AVL double rotation step-by-step trace."
    }
  ]
};
