// ─── B.L.U.E.-J. Concept Registry & Assessments ──────────────────────────────
// Single source of truth that maps EVERY curriculum task to a named, measurable
// concept (learning objective) and at least one real, objectively-graded
// assessment. Two assessment kinds:
//   • "code"  — the learner writes a program; we run it against test cases and
//               compare stdout. Cross-language (python/js/cpp/c).
//   • "quiz"  — objective multiple-choice with a fixed answer key. Used for
//               theory paths that cannot be executed in the sandbox
//               (Transformers, Big-O, SQL, Normalization, Turing Machines, ...).
//
// SECURITY: this module contains answer keys (expectedStdout for hidden cases,
// quiz correctOptionId). NEVER ship the raw registry to the client. Use
// getPublicRegistry() which strips every answer and every hidden expected value.

export const REGISTRY_VERSION = "1.0.0";
export const DEFAULT_MASTERY_THRESHOLD = 80;

export type AssessmentLanguage = "python" | "javascript" | "cpp" | "c";

export interface TestCase {
  id: string;
  stdin?: string;
  argv?: string[];
  expectedStdout: string;
  points: number;
  hidden?: boolean; // hidden cases never reveal expectedStdout to the client
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string; // answer key — stripped from public registry
  points: number;
  explanation?: string;
}

export interface CodeAssessment {
  id: string;
  conceptId: string;
  type: "code";
  title: string;
  prompt: string;
  languages: AssessmentLanguage[];
  cases: TestCase[];
}

export interface QuizAssessment {
  id: string;
  conceptId: string;
  type: "quiz";
  title: string;
  prompt: string;
  questions: QuizQuestion[];
}

export type Assessment = CodeAssessment | QuizAssessment;

export interface Concept {
  id: string;
  name: string;
  category: string; // phase name
  phaseId: number;
  taskIds: string[];
  objectives: string[];
  weight: number;
  masteryThreshold: number;
}

// ─── Concepts (1:1 with curriculum tasks) ────────────────────────────────────
export const CONCEPTS: Concept[] = [
  { id: "p0t0", name: "Output & Program Entry", category: "Initialization", phaseId: 0, taskIds: ["p0t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Produce exact program output", "Understand the program entry point"] },
  { id: "p0t1", name: "Variables & Arithmetic", category: "Initialization", phaseId: 0, taskIds: ["p0t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Read input into variables", "Apply arithmetic operators"] },
  { id: "p0t2", name: "Data Types", category: "Initialization", phaseId: 0, taskIds: ["p0t2"], weight: 1, masteryThreshold: 80,
    objectives: ["Distinguish primitive types", "Reason about type behavior and mutability"] },

  { id: "p1t0", name: "Lists & Arrays", category: "Data Structures", phaseId: 1, taskIds: ["p1t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Store sequential data", "Aggregate over a collection"] },
  { id: "p1t1", name: "Dictionaries & Hash Maps", category: "Data Structures", phaseId: 1, taskIds: ["p1t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Map keys to values", "Compute frequencies"] },

  { id: "p2t0", name: "Conditional Logic", category: "Control Flow", phaseId: 2, taskIds: ["p2t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Branch on conditions", "Handle multiple cases"] },
  { id: "p2t1", name: "Iteration & Loops", category: "Control Flow", phaseId: 2, taskIds: ["p2t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Repeat work with loops", "Accumulate results"] },

  { id: "p3t0", name: "Functions & Decomposition", category: "Functions & OOP", phaseId: 3, taskIds: ["p3t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Define reusable functions", "Decompose a problem"] },
  { id: "p3t1", name: "Object-Oriented Design", category: "Functions & OOP", phaseId: 3, taskIds: ["p3t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Apply encapsulation & inheritance", "Reason about classes vs objects"] },

  { id: "p4t0", name: "NumPy & Vectorization", category: "AI Libraries", phaseId: 4, taskIds: ["p4t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Understand ndarrays", "Reason about vectorized math"] },
  { id: "p4t1", name: "Transformer Architecture", category: "AI Libraries", phaseId: 4, taskIds: ["p4t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Explain self-attention", "Understand parallel token processing"] },

  { id: "p5t0", name: "Large Language Models", category: "Your AI Clone", phaseId: 5, taskIds: ["p5t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Explain next-token prediction", "Understand sampling & fine-tuning"] },

  { id: "p6t0", name: "Linked Lists", category: "CS Fundamentals", phaseId: 6, taskIds: ["p6t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Model nodes & pointers", "Traverse and reverse a chain"] },
  { id: "p6t1", name: "Binary Search Trees", category: "CS Fundamentals", phaseId: 6, taskIds: ["p6t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Maintain ordered structure", "Perform in-order traversal"] },

  { id: "p7t0", name: "Sorting Algorithms", category: "Algorithms", phaseId: 7, taskIds: ["p7t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Order data deterministically", "Apply a sorting strategy"] },
  { id: "p7t1", name: "Asymptotic Complexity", category: "Algorithms", phaseId: 7, taskIds: ["p7t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Classify Big-O growth", "Compare algorithm efficiency"] },

  { id: "p8t0", name: "SQL Querying", category: "Database Design", phaseId: 8, taskIds: ["p8t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Select & filter rows", "Join related tables"] },
  { id: "p8t1", name: "Normalization", category: "Database Design", phaseId: 8, taskIds: ["p8t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Apply normal forms", "Eliminate redundancy"] },

  { id: "p9t0", name: "Finite Automata", category: "Computational Theory", phaseId: 9, taskIds: ["p9t0"], weight: 1, masteryThreshold: 80,
    objectives: ["Model states & transitions", "Decide string acceptance"] },
  { id: "p9t1", name: "Turing Machines", category: "Computational Theory", phaseId: 9, taskIds: ["p9t1"], weight: 1, masteryThreshold: 80,
    objectives: ["Understand the universal model", "Reason about decidability"] },
];

const ALL_CODE_LANGS: AssessmentLanguage[] = ["python", "javascript", "cpp", "c"];

// ─── Assessments ─────────────────────────────────────────────────────────────
export const ASSESSMENTS: Assessment[] = [
  // P0 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p0t0", conceptId: "p0t0", type: "code", title: "First Contact",
    prompt: "Write a program that prints exactly two lines:\nLine 1: Hello, World\nLine 2: J. is online",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", expectedStdout: "Hello, World\nJ. is online", points: 100 },
    ],
  },
  {
    id: "a-p0t1", conceptId: "p0t1", type: "code", title: "Variables & Arithmetic",
    prompt: "Read two integers a and b from standard input (whitespace-separated). Print three lines: a+b, then a-b, then a*b.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "3 4", expectedStdout: "7\n-1\n12", points: 34 },
      { id: "c2", stdin: "10 5", expectedStdout: "15\n5\n50", points: 33, hidden: true },
      { id: "c3", stdin: "0 7", expectedStdout: "7\n-7\n0", points: 33, hidden: true },
    ],
  },
  {
    id: "a-p0t2", conceptId: "p0t2", type: "quiz", title: "Data Types Exam",
    prompt: "Answer the following about primitive data types.",
    questions: [
      { id: "q1", prompt: "Which best describes a boolean value?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "Any whole number" }, { id: "b", text: "A true/false value" }, { id: "c", text: "A piece of text" }, { id: "d", text: "A decimal number" }],
        explanation: "A boolean holds only true or false." },
      { id: "q2", prompt: "In Python 3, what is the type of the result of 7 / 2?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "int" }, { id: "b", text: "str" }, { id: "c", text: "float" }, { id: "d", text: "bool" }],
        explanation: "/ is true division and returns a float (3.5)." },
      { id: "q3", prompt: "Which of these is an immutable type in Python?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "list" }, { id: "b", text: "dict" }, { id: "c", text: "tuple" }, { id: "d", text: "set" }],
        explanation: "Tuples cannot be changed after creation." },
      { id: "q4", prompt: "What does len(\"J.\") evaluate to?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "1" }, { id: "b", text: "2" }, { id: "c", text: "3" }, { id: "d", text: "Error" }],
        explanation: "The string has two characters: 'J' and '.'." },
    ],
  },

  // P1 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p1t0", conceptId: "p1t0", type: "code", title: "List Aggregation",
    prompt: "Line 1 of input is N. Line 2 has N whitespace-separated integers. Print their sum on line 1 and their maximum on line 2.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "5\n3 1 4 1 5", expectedStdout: "14\n5", points: 34 },
      { id: "c2", stdin: "3\n-2 -5 -1", expectedStdout: "-8\n-1", points: 33, hidden: true },
      { id: "c3", stdin: "1\n42", expectedStdout: "42\n42", points: 33, hidden: true },
    ],
  },
  {
    id: "a-p1t1", conceptId: "p1t1", type: "code", title: "Word Frequencies",
    prompt: "Input is one line of whitespace-separated words. Print the number of DISTINCT words on line 1, then the occurrence count of the single most frequent word on line 2. (Inputs guarantee a unique most-frequent word.)",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "a b a c a b", expectedStdout: "3\n3", points: 34 },
      { id: "c2", stdin: "x y z", expectedStdout: "3\n1", points: 33, hidden: true },
      { id: "c3", stdin: "hi hi hi hi bye", expectedStdout: "2\n4", points: 33, hidden: true },
    ],
  },

  // P2 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p2t0", conceptId: "p2t0", type: "code", title: "Sign Classifier",
    prompt: "Read an integer n. Print 'positive' if n > 0, 'negative' if n < 0, otherwise 'zero'.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "5", expectedStdout: "positive", points: 34 },
      { id: "c2", stdin: "-3", expectedStdout: "negative", points: 33, hidden: true },
      { id: "c3", stdin: "0", expectedStdout: "zero", points: 33, hidden: true },
    ],
  },
  {
    id: "a-p2t1", conceptId: "p2t1", type: "code", title: "Series Sum",
    prompt: "Read an integer n (n >= 1). Print the sum 1 + 2 + ... + n.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "5", expectedStdout: "15", points: 34 },
      { id: "c2", stdin: "1", expectedStdout: "1", points: 33, hidden: true },
      { id: "c3", stdin: "100", expectedStdout: "5050", points: 33, hidden: true },
    ],
  },

  // P3 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p3t0", conceptId: "p3t0", type: "code", title: "Primality Function",
    prompt: "Read an integer n (n >= 2). Print 'prime' if n is prime, otherwise 'composite'. Implement a reusable primality check.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "7", expectedStdout: "prime", points: 25 },
      { id: "c2", stdin: "12", expectedStdout: "composite", points: 25, hidden: true },
      { id: "c3", stdin: "2", expectedStdout: "prime", points: 25, hidden: true },
      { id: "c4", stdin: "1000", expectedStdout: "composite", points: 25, hidden: true },
    ],
  },
  {
    id: "a-p3t1", conceptId: "p3t1", type: "quiz", title: "OOP Principles Exam",
    prompt: "Answer the following about object-oriented design.",
    questions: [
      { id: "q1", prompt: "What does encapsulation primarily provide?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "Faster loops" }, { id: "b", text: "Bundling data with methods and hiding internal state" }, { id: "c", text: "Automatic memory allocation" }, { id: "d", text: "Parallel execution" }],
        explanation: "Encapsulation groups state and behavior while hiding internals." },
      { id: "q2", prompt: "A class is to an object as a ___ is to a ___.", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "blueprint ... building" }, { id: "b", text: "building ... blueprint" }, { id: "c", text: "function ... variable" }, { id: "d", text: "list ... index" }],
        explanation: "A class is the blueprint; an object is the instance built from it." },
      { id: "q3", prompt: "Which principle lets a subclass provide its own version of a parent method?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "Encapsulation" }, { id: "b", text: "Polymorphism" }, { id: "c", text: "Abstraction" }, { id: "d", text: "Composition" }],
        explanation: "Polymorphism / method overriding enables specialized behavior." },
      { id: "q4", prompt: "In `class Dog:` with `def __init__(self): ...`, what is __init__?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "A destructor" }, { id: "b", text: "A static method" }, { id: "c", text: "The constructor / initializer" }, { id: "d", text: "A class variable" }],
        explanation: "__init__ initializes a new instance." },
    ],
  },

  // P4 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p4t0", conceptId: "p4t0", type: "quiz", title: "NumPy Fundamentals Exam",
    prompt: "Answer the following about NumPy and vectorized computation.",
    questions: [
      { id: "q1", prompt: "What is NumPy's core data structure?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "list" }, { id: "b", text: "DataFrame" }, { id: "c", text: "ndarray" }, { id: "d", text: "tensor graph" }],
        explanation: "NumPy is built around the N-dimensional array (ndarray)." },
      { id: "q2", prompt: "Why are vectorized NumPy operations faster than equivalent Python loops?", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "They run in optimized C without per-element Python overhead" }, { id: "b", text: "They use the GPU automatically" }, { id: "c", text: "They cache every result to disk" }, { id: "d", text: "They skip computing some elements" }],
        explanation: "Vectorized ops execute in compiled C over contiguous memory." },
      { id: "q3", prompt: "What shape does np.zeros((2, 3)) produce?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "3 rows, 2 columns" }, { id: "b", text: "2 rows, 3 columns" }, { id: "c", text: "A flat array of 6 zeros" }, { id: "d", text: "A scalar 0" }],
        explanation: "Shape (2, 3) means 2 rows by 3 columns." },
      { id: "q4", prompt: "Which operator performs matrix multiplication on NumPy arrays?", points: 25, correctOptionId: "d",
        options: [{ id: "a", text: "+" }, { id: "b", text: "*" }, { id: "c", text: "**" }, { id: "d", text: "@" }],
        explanation: "* is element-wise; @ is matrix multiplication." },
    ],
  },
  {
    id: "a-p4t1", conceptId: "p4t1", type: "quiz", title: "Transformer Architecture Exam",
    prompt: "Answer the following about the Transformer architecture.",
    questions: [
      { id: "q1", prompt: "What is the key innovation of the Transformer (Vaswani et al., 2017)?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "Convolutional filters" }, { id: "b", text: "The self-attention mechanism" }, { id: "c", text: "Recurrent cells" }, { id: "d", text: "Decision trees" }],
        explanation: "Self-attention replaced recurrence/convolution." },
      { id: "q2", prompt: "Compared to RNNs, Transformers process the tokens of a sequence...", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "in parallel" }, { id: "b", text: "strictly one at a time" }, { id: "c", text: "in reverse only" }, { id: "d", text: "never" }],
        explanation: "Attention lets all positions be processed in parallel." },
      { id: "q3", prompt: "Why do Transformers need positional encodings?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "To compress the model" }, { id: "b", text: "To pick the learning rate" }, { id: "c", text: "Because attention itself has no notion of token order" }, { id: "d", text: "To add dropout" }],
        explanation: "Positional encodings inject order information." },
      { id: "q4", prompt: "In attention, what do Q, K, and V stand for?", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "Query, Key, Value" }, { id: "b", text: "Quantize, Kernel, Vector" }, { id: "c", text: "Quality, Knowledge, Vision" }, { id: "d", text: "Quick, Keep, Verify" }],
        explanation: "Attention scores queries against keys to weight values." },
    ],
  },

  // P5 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p5t0", conceptId: "p5t0", type: "quiz", title: "Language Model Exam",
    prompt: "Answer the following about large language models.",
    questions: [
      { id: "q1", prompt: "Fundamentally, an LLM generates text by...", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "Looking up answers in a database" }, { id: "b", text: "Predicting the next token given prior tokens" }, { id: "c", text: "Compiling source code" }, { id: "d", text: "Running a search engine" }],
        explanation: "LLMs are next-token predictors." },
      { id: "q2", prompt: "What does the 'temperature' sampling parameter control?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "Model size" }, { id: "b", text: "Training speed" }, { id: "c", text: "Randomness / creativity of the output" }, { id: "d", text: "GPU heat" }],
        explanation: "Higher temperature = more random sampling." },
      { id: "q3", prompt: "How does fine-tuning differ from prompting?", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "Fine-tuning updates the model's weights on new data" }, { id: "b", text: "Fine-tuning only changes the prompt" }, { id: "c", text: "They are identical" }, { id: "d", text: "Prompting retrains from scratch" }],
        explanation: "Fine-tuning adjusts weights; prompting only changes input." },
      { id: "q4", prompt: "What is a 'token'?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "Always exactly one English word" }, { id: "b", text: "A chunk of text (often a subword) the model processes" }, { id: "c", text: "A single bit" }, { id: "d", text: "A password" }],
        explanation: "Tokens are subword units, not always whole words." },
    ],
  },

  // P6 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p6t0", conceptId: "p6t0", type: "code", title: "Reverse a Chain",
    prompt: "Line 1 is N. Line 2 has N whitespace-separated integers in list order. Print the same values REVERSED, space-separated, on one line (as if reversing a linked list).",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "5\n1 2 3 4 5", expectedStdout: "5 4 3 2 1", points: 34 },
      { id: "c2", stdin: "1\n7", expectedStdout: "7", points: 33, hidden: true },
      { id: "c3", stdin: "3\n-1 0 9", expectedStdout: "9 0 -1", points: 33, hidden: true },
    ],
  },
  {
    id: "a-p6t1", conceptId: "p6t1", type: "code", title: "BST In-Order Traversal",
    prompt: "Line 1 is N. Line 2 has N whitespace-separated DISTINCT integers. Insert them into a binary search tree in the given order, then print the in-order traversal (ascending), space-separated.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "5\n5 3 7 2 4", expectedStdout: "2 3 4 5 7", points: 34 },
      { id: "c2", stdin: "4\n10 5 15 1", expectedStdout: "1 5 10 15", points: 33, hidden: true },
      { id: "c3", stdin: "1\n42", expectedStdout: "42", points: 33, hidden: true },
    ],
  },

  // P7 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p7t0", conceptId: "p7t0", type: "code", title: "Ascending Sort",
    prompt: "Line 1 is N. Line 2 has N whitespace-separated integers. Print them sorted in ascending order, space-separated, on one line.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "5\n3 1 4 1 5", expectedStdout: "1 1 3 4 5", points: 34 },
      { id: "c2", stdin: "3\n9 -2 0", expectedStdout: "-2 0 9", points: 33, hidden: true },
      { id: "c3", stdin: "2\n2 1", expectedStdout: "1 2", points: 33, hidden: true },
    ],
  },
  {
    id: "a-p7t1", conceptId: "p7t1", type: "quiz", title: "Big-O Analysis Exam",
    prompt: "Answer the following about asymptotic complexity.",
    questions: [
      { id: "q1", prompt: "What is the time complexity of binary search on a sorted array of n elements?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "O(n)" }, { id: "b", text: "O(n^2)" }, { id: "c", text: "O(log n)" }, { id: "d", text: "O(1)" }],
        explanation: "Each step halves the search space." },
      { id: "q2", prompt: "For large n, which grows the FASTEST (worst)?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "O(n)" }, { id: "b", text: "O(n^2)" }, { id: "c", text: "O(log n)" }, { id: "d", text: "O(n log n)" }],
        explanation: "Quadratic dominates the others as n grows." },
      { id: "q3", prompt: "Iterating once through n items is...", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "O(n)" }, { id: "b", text: "O(1)" }, { id: "c", text: "O(log n)" }, { id: "d", text: "O(n^2)" }],
        explanation: "A single pass is linear." },
      { id: "q4", prompt: "Accessing an array element by index is...", points: 25, correctOptionId: "d",
        options: [{ id: "a", text: "O(n)" }, { id: "b", text: "O(log n)" }, { id: "c", text: "O(n log n)" }, { id: "d", text: "O(1)" }],
        explanation: "Indexed access is constant time." },
    ],
  },

  // P8 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p8t0", conceptId: "p8t0", type: "quiz", title: "SQL Basics Exam",
    prompt: "Answer the following about SQL.",
    questions: [
      { id: "q1", prompt: "Which clause filters which rows are returned?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "ORDER BY" }, { id: "b", text: "WHERE" }, { id: "c", text: "GROUP BY" }, { id: "d", text: "LIMIT" }],
        explanation: "WHERE filters rows by a predicate." },
      { id: "q2", prompt: "Which statement retrieves data from a table?", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "SELECT" }, { id: "b", text: "INSERT" }, { id: "c", text: "UPDATE" }, { id: "d", text: "DELETE" }],
        explanation: "SELECT reads rows." },
      { id: "q3", prompt: "Which operation combines rows from two tables on a related column?", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "UNION" }, { id: "b", text: "WHERE" }, { id: "c", text: "JOIN" }, { id: "d", text: "HAVING" }],
        explanation: "JOIN matches related rows across tables." },
      { id: "q4", prompt: "Which keyword removes duplicate rows from a result set?", points: 25, correctOptionId: "d",
        options: [{ id: "a", text: "UNIQUE" }, { id: "b", text: "ONLY" }, { id: "c", text: "FILTER" }, { id: "d", text: "DISTINCT" }],
        explanation: "SELECT DISTINCT removes duplicates." },
    ],
  },
  {
    id: "a-p8t1", conceptId: "p8t1", type: "quiz", title: "Normalization Exam",
    prompt: "Answer the following about database normalization.",
    questions: [
      { id: "q1", prompt: "First Normal Form (1NF) requires that...", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "Every table has a foreign key" }, { id: "b", text: "Column values are atomic with no repeating groups" }, { id: "c", text: "All columns are integers" }, { id: "d", text: "Tables have fewer than 10 columns" }],
        explanation: "1NF requires atomic values." },
      { id: "q2", prompt: "Normalization primarily reduces...", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "Data redundancy" }, { id: "b", text: "Query syntax" }, { id: "c", text: "Disk speed" }, { id: "d", text: "Network latency" }],
        explanation: "Normalization removes duplicated data." },
      { id: "q3", prompt: "A foreign key...", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "Encrypts a column" }, { id: "b", text: "Is always auto-incremented" }, { id: "c", text: "References the primary key of another table" }, { id: "d", text: "Must be unique within its own table" }],
        explanation: "Foreign keys reference another table's primary key." },
      { id: "q4", prompt: "Second Normal Form (2NF) removes...", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "All foreign keys" }, { id: "b", text: "Partial dependencies on part of a composite key" }, { id: "c", text: "Every index" }, { id: "d", text: "Transitive dependencies" }],
        explanation: "2NF eliminates partial dependencies; 3NF handles transitive ones." },
    ],
  },

  // P9 ─────────────────────────────────────────────────────────────────────
  {
    id: "a-p9t0", conceptId: "p9t0", type: "code", title: "DFA: Even Number of 1s",
    prompt: "A DFA accepts binary strings with an EVEN number of 1s. Input is one line: a non-empty string of 0s and 1s. Print 'ACCEPT' if it contains an even number of 1s, otherwise 'REJECT'.",
    languages: ALL_CODE_LANGS,
    cases: [
      { id: "c1", stdin: "110", expectedStdout: "ACCEPT", points: 34 },
      { id: "c2", stdin: "1011", expectedStdout: "REJECT", points: 33, hidden: true },
      { id: "c3", stdin: "0000", expectedStdout: "ACCEPT", points: 33, hidden: true },
    ],
  },
  {
    id: "a-p9t1", conceptId: "p9t1", type: "quiz", title: "Turing Machine Exam",
    prompt: "Answer the following about computational theory.",
    questions: [
      { id: "q1", prompt: "A Turing machine consists of...", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "A CPU and RAM only" }, { id: "b", text: "An infinite tape, a head, and a transition function" }, { id: "c", text: "A database and a query planner" }, { id: "d", text: "A compiler and a linker" }],
        explanation: "The classic model: tape + head + finite-state control." },
      { id: "q2", prompt: "The Church-Turing thesis states that...", points: 25, correctOptionId: "a",
        options: [{ id: "a", text: "Anything effectively computable can be computed by a Turing machine" }, { id: "b", text: "All programs halt" }, { id: "c", text: "P equals NP" }, { id: "d", text: "Every language is regular" }],
        explanation: "It equates intuitive computability with Turing-computability." },
      { id: "q3", prompt: "The Halting Problem is...", points: 25, correctOptionId: "c",
        options: [{ id: "a", text: "Solvable in O(n)" }, { id: "b", text: "Solvable only with more RAM" }, { id: "c", text: "Undecidable" }, { id: "d", text: "A sorting algorithm" }],
        explanation: "No algorithm decides halting for all program/input pairs." },
      { id: "q4", prompt: "What distinguishes a Turing machine from a finite automaton?", points: 25, correctOptionId: "b",
        options: [{ id: "a", text: "It runs faster" }, { id: "b", text: "It has unbounded memory (the tape)" }, { id: "c", text: "It cannot loop" }, { id: "d", text: "It has no states" }],
        explanation: "Unbounded tape gives strictly more power than finite memory." },
    ],
  },
];

// ─── Lookups ─────────────────────────────────────────────────────────────────
const CONCEPT_BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]));
const ASSESSMENT_BY_ID = new Map(ASSESSMENTS.map((a) => [a.id, a]));

export function getConcept(conceptId: string): Concept | undefined {
  return CONCEPT_BY_ID.get(conceptId);
}

export function getAssessment(assessmentId: string): Assessment | undefined {
  return ASSESSMENT_BY_ID.get(assessmentId);
}

export function getConceptsForTask(taskId: string): Concept[] {
  return CONCEPTS.filter((c) => c.taskIds.includes(taskId));
}

export function getAssessmentsForConcept(conceptId: string): Assessment[] {
  return ASSESSMENTS.filter((a) => a.conceptId === conceptId);
}

export function totalPointsFor(assessment: Assessment): number {
  return assessment.type === "code"
    ? assessment.cases.reduce((s, c) => s + c.points, 0)
    : assessment.questions.reduce((s, q) => s + q.points, 0);
}

// ─── Public (answer-stripped) registry for the client ────────────────────────
export interface PublicSampleCase {
  id: string;
  stdin?: string;
  argv?: string[];
  expectedStdout: string; // only for non-hidden cases
  points: number;
}

export interface PublicQuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  points: number;
}

export interface PublicAssessment {
  id: string;
  conceptId: string;
  type: "code" | "quiz";
  title: string;
  prompt: string;
  totalPoints: number;
  languages?: AssessmentLanguage[];
  sampleCases?: PublicSampleCase[];
  hiddenCaseCount?: number;
  questions?: PublicQuizQuestion[];
}

export interface PublicConcept extends Concept {
  assessments: PublicAssessment[];
}

export interface PublicRegistry {
  version: string;
  masteryThreshold: number;
  concepts: PublicConcept[];
}

function toPublicAssessment(a: Assessment): PublicAssessment {
  if (a.type === "code") {
    const visible = a.cases.filter((c) => !c.hidden);
    return {
      id: a.id, conceptId: a.conceptId, type: "code", title: a.title, prompt: a.prompt,
      totalPoints: totalPointsFor(a),
      languages: a.languages,
      sampleCases: visible.map((c) => ({ id: c.id, stdin: c.stdin, argv: c.argv, expectedStdout: c.expectedStdout, points: c.points })),
      hiddenCaseCount: a.cases.length - visible.length,
    };
  }
  return {
    id: a.id, conceptId: a.conceptId, type: "quiz", title: a.title, prompt: a.prompt,
    totalPoints: totalPointsFor(a),
    questions: a.questions.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options, points: q.points })),
  };
}

export function getPublicRegistry(): PublicRegistry {
  return {
    version: REGISTRY_VERSION,
    masteryThreshold: DEFAULT_MASTERY_THRESHOLD,
    concepts: CONCEPTS.map((c) => ({
      ...c,
      assessments: getAssessmentsForConcept(c.id).map(toPublicAssessment),
    })),
  };
}
