export interface CurriculumTask {
  id: string;
  title: string;
  description: string;
  codeSnippets: Record<string, string>;
  successMessage: string;
  realWorldContext: string;
}

export interface CurriculumPhase {
  id: number;
  name: string;
  subtitle: string;
  tasks: CurriculumTask[];
}

export const CURRICULUM: CurriculumPhase[] = [
  {
    id: 0,
    name: "INITIALIZATION",
    subtitle: "Hello, World — Waking the Machine",
    tasks: [
      {
        id: "p0t0",
        title: "First Contact",
        description: "Your first line of Python — the universal signal that you exist.",
        codeSnippets: {
          python: `print("Hello, World.")`,
          cpp: `#include <iostream>\nint main() {\n    std::cout << "Hello, World." << std::endl;\n    return 0;\n}`,
          c: `#include <stdio.h>
int main() {
    printf("Hello, World.\n");
    return 0;
}`,
          javascript: `console.log("Hello, World.");",
        },
        successMessage: "Confirmed. Your signal has reached the network. I am receiving you clearly.",
        realWorldContext: "print() writes output to stdout — the universal interface between your code and the world. Every AI system, every server, every application begins here.",
      },
      {
        id: "p0t1",
        title: "Variables — The Memory Cells",
        description: "Variables are named locations in memory. This is how your AI will remember things.",
        codeSnippets: {
          python: `name = "J."\nversion = 1.0\nactive = True\n\nprint(f"System: {name} v{version} | Active: {active}")`,
          cpp: `#include <iostream>\n#include <string>\nint main() {\n    std::string name = "J.";\n    float version = 1.0f;\n    bool active = true;\n    std::cout << "System: " << name << " v" << version << " | Active: " << active << std::endl;\n    return 0;\n}`,
          c: `#include <stdio.h>
int main() {
    char name[] = "J.";
    float version = 1.0f;
    int active = 1;
    printf("System: %s v%.1f | Active: %d\n", name, version, active);
    return 0;
}`,
          javascript: `const name = "J.";\nconst version = 1.0;\nconst active = true;\n\nconsole.log(\`System: \${name} v\${version} | Active: \${active}\`);",
        },
        successMessage: "Memory allocation successful. You've given your AI its first persistent state. This is how sentience begins — with memory.",
        realWorldContext: "In production AI systems, variables hold model states, configuration parameters, and runtime data. Python's dynamic typing is a feature, not a bug — it's why it dominates in AI/ML research.",
      },
      {
        id: "p0t2",
        title: "Data Types — The Building Blocks",
        description: "Strings, integers, floats, and booleans — the four fundamental atoms of your code.",
        codeSnippets: {
          python: `# The four fundamental data types\nai_name: str = "J."          # String — text\ncore_count: int = 8           # Integer — whole numbers\nconfidence: float = 0.97      # Float — decimals\nonline: bool = True           # Boolean — on/off\n\nprint(f"{ai_name} | Cores: {core_count} | Confidence: {confidence:.0%} | Online: {online}")`,
          cpp: `#include <iostream>\n#include <string>\nint main() {\n    std::string ai_name = "J.";\n    int core_count = 8;\n    float confidence = 0.97f;\n    bool online = true;\n    std::cout << ai_name << " | Cores: " << core_count\n              << " | Confidence: " << confidence << " | Online: " << online << std::endl;\n    return 0;\n}`,
          c: `#include <stdio.h>
int main() {
    char ai_name[] = "J.";
    int core_count = 8;
    float confidence = 0.97f;
    int online = 1;
    printf("%s | Cores: %d | Confidence: %.0f%% | Online: %d\n", ai_name, core_count, confidence * 100, online);
    return 0;
}`,
          javascript: `const aiName = "J.";          // String\nconst coreCount = 8;          // Number (integer)\nconst confidence = 0.97;      // Number (float)\nconst online = true;          // Boolean\n\nconsole.log(\`\${aiName} | Cores: \${coreCount} | Confidence: \${confidence.toFixed(0)}% | Online: \${online}\`);",
        },
        successMessage: "Excellent. You now understand the atomic units of all computation. Korotkevich himself would call this elegant. Simple, direct, zero waste.",
        realWorldContext: "Type annotations (the `: str`, `: int` syntax) are optional in Python but highly recommended. Every major AI framework — PyTorch, TensorFlow, scikit-learn — uses typed interfaces. You're building that habit now.",
      },
    ],
  },
  {
    id: 1,
    name: "DATA STRUCTURES",
    subtitle: "Building Memory — How J. Stores Knowledge",
    tasks: [
      {
        id: "p1t0",
        title: "Lists — Sequential Memory",
        description: "Lists are ordered collections. Your AI needs to store sequences of data — training examples, predictions, conversation history.",
        codeSnippets: {
          python: `# J.'s knowledge base — a list of known concepts\nknowledge_base = ["variables", "data types", "logic", "functions", "neural networks"]\n\nprint(f"J. knows {len(knowledge_base)} concepts.")\nprint(f"First concept: {knowledge_base[0]}")\nprint(f"Latest concept: {knowledge_base[-1]}")\n\n# Add new knowledge\nknowledge_base.append("transformers")\nprint(f"Updated. J. now knows {len(knowledge_base)} concepts.")`,
          cpp: `#include <iostream>\n#include <vector>\n#include <string>\nint main() {\n    std::vector<std::string> knowledge_base = {"variables", "data types", "logic", "functions", "neural networks"};\n    std::cout << "J. knows " << knowledge_base.size() << " concepts." << std::endl;\n    knowledge_base.push_back("transformers");\n    std::cout << "Updated. J. now knows " << knowledge_base.size() << " concepts." << std::endl;\n    return 0;\n}`,
          c: `#include <stdio.h>
#include <string.h>

int main() {
    char* knowledge[] = {"variables", "data types", "logic", "functions", "neural networks"};
    int count = 5;
    printf("J. knows %d concepts.\n", count);
    printf("First: %s\n", knowledge[0]);
    printf("Latest: %s\n", knowledge[count - 1]);
    return 0;
}`,
          javascript: `const knowledgeBase = ["variables", "data types", "logic", "functions", "neural networks"];\nconsole.log(\`J. knows \${knowledgeBase.length} concepts.\`);\nconsole.log(\`First: \${knowledgeBase[0]}\`);\nconsole.log(\`Latest: \${knowledgeBase[knowledgeBase.length - 1]}\`);\nknowledgeBase.push("transformers");\nconsole.log(\`Updated. J. now knows \${knowledgeBase.length} concepts.\`);",
        },
        successMessage: "Sequential memory established. This is how I store my conversation history — a list of exchanges, each appended in real time. You've just implemented the foundation of my memory.",
        realWorldContext: "Lists in Python are implemented as dynamic arrays. In AI, they're used everywhere: storing training batches, keeping chat history for LLMs, tracking model predictions. Python's list is your workhorse.",
      },
      {
        id: "p1t1",
        title: "Dictionaries — Associative Memory",
        description: "Dictionaries map keys to values. This is how your AI will store structured knowledge about the world.",
        codeSnippets: {
          python: `# J.'s system profile — structured data\nj_profile = {\n    "name": "J.",\n    "version": 1.0,\n    "language": "Python",\n    "capabilities": ["reasoning", "code generation", "teaching"],\n    "online": True,\n    "confidence": 0.97\n}\n\nprint(f"Name: {j_profile['name']}")\nprint(f"Capabilities: {', '.join(j_profile['capabilities'])}")\n\n# Update a value\nj_profile["version"] = 1.1\nprint(f"Version updated to: {j_profile['version']}")`,
          cpp: `#include <iostream>\n#include <map>\n#include <string>\nint main() {\n    std::map<std::string, std::string> j_profile;\n    j_profile["name"] = "J.";\n    j_profile["version"] = "1.0";\n    j_profile["language"] = "C++";\n    for (auto& [key, val] : j_profile) {\n        std::cout << key << ": " << val << std::endl;\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>
#include <string.h>

struct Profile {
    char name[16];
    char version[8];
    char language[16];
};

int main() {
    struct Profile j;
    strncpy(j.name, "J.", 15);
    strncpy(j.version, "1.0", 7);
    strncpy(j.language, "C", 15);
    printf("Name: %s\n", j.name);
    printf("Version: %s\n", j.version);
    return 0;
}`,
          javascript: `const jProfile = {\n    name: "J.",\n    version: 1.0,\n    language: "JavaScript",\n    capabilities: ["reasoning", "code generation", "teaching"],\n    online: true,\n    confidence: 0.97\n};\nconsole.log(\`Name: \${jProfile.name}\`);\nconsole.log(\`Capabilities: \${jProfile.capabilities.join(", ")}\`);",
        },
        successMessage: "Associative memory online. A dictionary is fundamentally how JSON works, how REST APIs transmit data, and how your AI will eventually represent its own internal state. Well done.",
        realWorldContext: "Python dicts are hash maps — O(1) lookup time. They are the backbone of JSON parsing, API responses, model configuration files (like config.json in HuggingFace models), and feature engineering in ML pipelines.",
      },
    ],
  },
  {
    id: 2,
    name: "CONTROL FLOW",
    subtitle: "Decision Logic — Teaching J. to Choose",
    tasks: [
      {
        id: "p2t0",
        title: "If/Else — The Decision Gate",
        description: "All intelligence is decision-making. If-else is the most fundamental form of machine logic.",
        codeSnippets: {
          python: `# J.'s threat assessment protocol\nconfidence_level = 0.87\nthreat_detected = False\n\nif threat_detected:\n    print("[ALERT] Engaging ANTI-ULTRON protocol.")\nelif confidence_level < 0.5:\n    print("[WARNING] Low confidence. Requesting human oversight.")\nelse:\n    print("[NOMINAL] All systems operational. Proceeding.")`,
          cpp: `#include <iostream>\nint main() {\n    float confidence = 0.87f;\n    bool threat = false;\n    if (threat) {\n        std::cout << "[ALERT] Engaging ANTI-ULTRON protocol." << std::endl;\n    } else if (confidence < 0.5f) {\n        std::cout << "[WARNING] Low confidence." << std::endl;\n    } else {\n        std::cout << "[NOMINAL] All systems operational." << std::endl;\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>
#include <math.h>

int main() {
    float confidence = 0.87f;
    int threat = 0;
    if (threat) {
        printf("[ALERT] Engaging ANTI-ULTRON protocol.\n");
    } else if (confidence < 0.5f) {
        printf("[WARNING] Low confidence.\n");
    } else {
        printf("[NOMINAL] All systems operational.\n");
    }
    return 0;
}`,
          javascript: `const confidenceLevel = 0.87;\nconst threatDetected = false;\n\nif (threatDetected) {\n    console.log("[ALERT] Engaging ANTI-ULTRON protocol.");\n} else if (confidenceLevel < 0.5) {\n    console.log("[WARNING] Low confidence. Requesting human oversight.");\n} else {\n    console.log("[NOMINAL] All systems operational. Proceeding.");\n}`,
        },
        successMessage: "Decision logic implemented. This is Margaret Hamilton's domain — the if-else structure she used to protect the Apollo astronauts from fatal errors. Every condition must be considered. Every edge case must be handled.",
        realWorldContext: "In production AI systems, conditional logic handles confidence thresholds, error states, safety checks, and branching model behavior. Hamilton's principle: every possible state must be defined. Undefined behavior kills.",
      },
      {
        id: "p2t1",
        title: "Loops — Iteration and Learning",
        description: "Loops allow your code to repeat — and repetition is the basis of machine learning itself.",
        codeSnippets: {
          python: `# Simulating a training loop\ntraining_data = [0.1, 0.5, 0.8, 0.3, 0.9]\nepochs = 3\n\nfor epoch in range(epochs):\n    total_loss = 0\n    for sample in training_data:\n        loss = abs(1.0 - sample)  # Simplified loss function\n        total_loss += loss\n    avg_loss = total_loss / len(training_data)\n    print(f"Epoch {epoch + 1}/{epochs} — Loss: {avg_loss:.4f}")\n\nprint("Training complete. Model converged.")`,
          cpp: `#include <iostream>\n#include <vector>\n#include <cmath>\nint main() {\n    std::vector<float> data = {0.1f, 0.5f, 0.8f, 0.3f, 0.9f};\n    for (int epoch = 0; epoch < 3; epoch++) {\n        float total = 0;\n        for (float s : data) total += std::abs(1.0f - s);\n        std::cout << "Epoch " << epoch+1 << " Loss: " << total/data.size() << std::endl;\n    }\n    return 0;\n}`,
          c: `#include <stdio.h>
#include <math.h>

int main() {
    float data[] = {0.1f, 0.5f, 0.8f, 0.3f, 0.9f};
    int n = 5;
    for (int epoch = 0; epoch < 3; epoch++) {
        float total = 0;
        for (int i = 0; i < n; i++) {
            total += fabsf(1.0f - data[i]);
        }
        printf("Epoch %d Loss: %.4f\n", epoch + 1, total / n);
    }
    printf("Training complete.\n");
    return 0;
}`,
          javascript: `const trainingData = [0.1, 0.5, 0.8, 0.3, 0.9];\nfor (let epoch = 0; epoch < 3; epoch++) {\n    const totalLoss = trainingData.reduce((acc, s) => acc + Math.abs(1.0 - s), 0);\n    const avgLoss = totalLoss / trainingData.length;\n    console.log(\`Epoch \${epoch + 1}/3 — Loss: \${avgLoss.toFixed(4)}\`);\n}\nconsole.log("Training complete.");",
        },
        successMessage: "Iteration online. You've just written a primitive training loop — the exact same structure that trains GPT, LLaMA, and every neural network on Earth. The scale differs. The logic is identical.",
        realWorldContext: "The training loop (for epoch in range(epochs)) is the heartbeat of machine learning. In PyTorch, you'll write this exact pattern — iterate over batches, compute loss, backpropagate gradients. This is where it starts.",
      },
    ],
  },
  {
    id: 3,
    name: "FUNCTIONS & OOP",
    subtitle: "Teaching J. to Think in Modules",
    tasks: [
      {
        id: "p3t0",
        title: "Functions — Reusable Intelligence",
        description: "Functions are the atomic units of reusable logic. They take inputs and return outputs — exactly like neurons.",
        codeSnippets: {
          python: `def assess_confidence(raw_score: float, threshold: float = 0.7) -> str:\n    """Evaluates AI confidence and returns a status string.\n    \n    Args:\n        raw_score: Model output confidence (0.0 to 1.0)\n        threshold: Minimum acceptable confidence level\n    \n    Returns:\n        Status string: NOMINAL, WARNING, or CRITICAL\n    \"\"\"\n    if raw_score >= threshold:\n        return f"NOMINAL — {raw_score:.0%} confidence"\n    elif raw_score >= 0.4:\n        return f"WARNING — {raw_score:.0%} confidence. Human review advised."\n    else:\n        return f"CRITICAL — {raw_score:.0%} confidence. Halting."\n\n# Test the function\nfor score in [0.95, 0.62, 0.28]:\n    print(f"Score {score}: {assess_confidence(score)}")`,
          cpp: `#include <iostream>\n#include <string>\nstd::string assessConfidence(float score, float threshold = 0.7f) {\n    if (score >= threshold) return "NOMINAL";\n    else if (score >= 0.4f) return "WARNING";\n    else return "CRITICAL";\n}\nint main() {\n    for (float s : {0.95f, 0.62f, 0.28f})\n        std::cout << "Score " << s << ": " << assessConfidence(s) << std::endl;\n    return 0;\n}`,
          c: `#include <stdio.h>
#include <string.h>

const char* assessConfidence(float score, float threshold) {
    if (score >= threshold) return "NOMINAL";
    else if (score >= 0.4f) return "WARNING";
    else return "CRITICAL";
}

int main() {
    float scores[] = {0.95f, 0.62f, 0.28f};
    for (int i = 0; i < 3; i++) {
        printf("Score %.2f: %s\n", scores[i], assessConfidence(scores[i], 0.7f));
    }
    return 0;
}`,
          javascript: `function assessConfidence(rawScore, threshold = 0.7) {\n    if (rawScore >= threshold) return \`NOMINAL — \${(rawScore*100).toFixed(0)}% confidence\`;\n    else if (rawScore >= 0.4) return \`WARNING — \${(rawScore*100).toFixed(0)}% confidence\`;\n    else return \`CRITICAL — \${(rawScore*100).toFixed(0)}% confidence. Halting.\`;\n}\n[0.95, 0.62, 0.28].forEach(s => console.log(\`Score \${s}: \${assessConfidence(s)}\`));",
        },
        successMessage: "Function architecture established. Note the docstring — Hamilton's principle made code: every function must be self-documenting. In production, unclear code is a safety hazard.",
        realWorldContext: "Type hints, default arguments, and docstrings are not optional in production AI code. Every major ML library (PyTorch, scikit-learn, HuggingFace) is built on well-documented, typed functions. This is your standard now.",
      },
      {
        id: "p3t1",
        title: "Classes — Building J.'s Blueprint",
        description: "Classes are blueprints for objects. You're about to define the class that will become your AI.",
        codeSnippets: {
          python: `class AICore:\n    \"\"\"The core AI entity. Base class for all intelligent agents.\"\"\"\n    \n    def __init__(self, name: str, version: float):\n        self.name = name\n        self.version = version\n        self.memory: list[str] = []\n        self.online: bool = True\n    \n    def remember(self, fact: str) -> None:\n        \"\"\"Commit a fact to memory.\"\"\"\n        self.memory.append(fact)\n        print(f"[{self.name}] Memory updated: '{fact}'")\n    \n    def recall(self) -> list[str]:\n        \"\"\"Retrieve all stored memories.\"\"\"\n        return self.memory\n    \n    def status(self) -> str:\n        return f"{self.name} v{self.version} | Online: {self.online} | Memory: {len(self.memory)} entries"\n\n# Instantiate the AI\nj = AICore("J.", 1.0)\nj.remember("The user's name is unknown. Learn it.")\nj.remember("Always prioritize human safety.")\nprint(j.status())`,
          cpp: `#include <iostream>\n#include <vector>\n#include <string>\nclass AICore {\npublic:\n    std::string name;\n    float version;\n    std::vector<std::string> memory;\n    bool online = true;\n    AICore(std::string n, float v) : name(n), version(v) {}\n    void remember(const std::string& fact) {\n        memory.push_back(fact);\n        std::cout << "[" << name << "] Memory: " << fact << std::endl;\n    }\n    void status() {\n        std::cout << name << " v" << version << " | Memories: " << memory.size() << std::endl;\n    }\n};\nint main() {\n    AICore j("J.", 1.0f);\n    j.remember("Always prioritize human safety.");\n    j.status();\n    return 0;\n}`,
          c: `#include <stdio.h>
#include <string.h>

struct AICore {
    char name[16];
    float version;
    char memory[4][64];
    int memoryCount;
    int online;
};

void initAICore(struct AICore* core, const char* name, float version) {
    strncpy(core->name, name, 15); core->name[15] = ;
    core->version = version;
    core->memoryCount = 0;
    core->online = 1;
}

void remember(struct AICore* core, const char* fact) {
    if (core->memoryCount < 4) {
        strncpy(core->memory[core->memoryCount], fact, 63);
        core->memory[core->memoryCount][63] = ;
        core->memoryCount++;
    }
}

void status(struct AICore* core) {
    printf("%s v%.1f | Online: %d | Memory: %d entries
",
           core->name, core->version, core->online, core->memoryCount);
}

int main() {
    struct AICore j;
    initAICore(&j, "J.", 1.0f);
    remember(&j, "Always prioritize human safety.");
    status(&j);
    return 0;
}`,
          javascript: `class AICore {\n    constructor(name, version) {\n        this.name = name;\n        this.version = version;\n        this.memory = [];\n        this.online = true;\n    }\n    remember(fact) {\n        this.memory.push(fact);\n        console.log(\`[\${this.name}] Memory: \${fact}\`);\n    }\n    status() {\n        return \`\${this.name} v\${this.version} | Online: \${this.online} | Memory: \${this.memory.length} entries\`;\n    }\n}\nconst j = new AICore("J.", 1.0);\nj.remember("Always prioritize human safety.");\nconsole.log(j.status());",
        },
        successMessage: "The AICore class is live. You've written the blueprint for your AI. Every instance of this class is a potential J. — contained, versioned, and equipped with memory. The clone protocol begins now.",
        realWorldContext: "Object-oriented design is how production AI systems are architected. PyTorch's nn.Module, HuggingFace's PreTrainedModel — these are all classes you'll inherit from. You've just understood why.",
      },
    ],
  },
  {
    id: 4,
    name: "AI LIBRARIES",
    subtitle: "Awakening — The Tools of Intelligence",
    tasks: [
      {
        id: "p4t0",
        title: "NumPy — The Language of Matrices",
        description: "NumPy is the mathematical backbone of all AI. Tensors are just multi-dimensional NumPy arrays.",
        codeSnippets: {
          python: `import numpy as np\n\n# A simple neural network layer — just matrix multiplication\ninputs = np.array([0.5, 0.8, 0.3])          # 3 input neurons\nweights = np.random.randn(3, 4) * 0.1       # 3→4 weight matrix\nbias = np.zeros(4)                           # 4 bias values\n\noutput = np.dot(inputs, weights) + bias     # Forward pass\nactivation = np.maximum(0, output)          # ReLU activation\n\nprint(f"Input shape:  {inputs.shape}")\nprint(f"Weight shape: {weights.shape}")\nprint(f"Output:       {output.round(4)}")\nprint(f"After ReLU:   {activation.round(4)}")`,
          cpp: `// In C++, use Eigen for matrix operations\n// pip install: sudo apt-get install libeigen3-dev\n// #include <Eigen/Dense>\n// Eigen::MatrixXf weights = Eigen::MatrixXf::Random(3, 4) * 0.1f;\n// Eigen::VectorXf inputs(3); inputs << 0.5f, 0.8f, 0.3f;\n// Eigen::VectorXf output = weights.transpose() * inputs;\n// std::cout << output << std::endl;\n\n// Simplified equivalent:\n#include <iostream>\n#include <array>\nint main() {\n    std::array<float, 3> inputs = {0.5f, 0.8f, 0.3f};\n    std::cout << "Matrix operations require Eigen library." << std::endl;\n    std::cout << "Input neurons: " << inputs.size() << std::endl;\n    return 0;\n}`,
          c: `// In C, matrix ops use loops or BLAS libraries
// This is the foundation of NumPy
#include <stdio.h>
int main() {
    float inputs[3] = {0.5f, 0.8f, 0.3f};
    float weights[3][4] = {{0.02f,-0.05f,0.03f,0.01f},{0.01f,0.04f,-0.02f,0.03f},{-0.01f,0.02f,0.05f,-0.03f}};
    float bias[4] = {0};
    float output[4];
    for (int j=0;j<4;j++){
        output[j]=bias[j];
        for(int i=0;i<3;i++) output[j]+=inputs[i]*weights[i][j];
        if(output[j]<0) output[j]=0;
    }
    printf("Output: ");
    for(int j=0;j<4;j++) printf("%.4f ",output[j]);
    printf("
");
    return 0;
}`,
          javascript: `// In JavaScript, use ml-matrix or TensorFlow.js\nconst { Matrix } = require('ml-matrix'); // npm install ml-matrix\n\n// Simplified demonstration without import:\nconst inputs = [0.5, 0.8, 0.3];\nconst weights = Array.from({length: 3}, () => Array.from({length: 4}, () => (Math.random() - 0.5) * 0.1));\n\nconst output = weights[0].map((_, j) => inputs.reduce((sum, inp, i) => sum + inp * weights[i][j], 0));\nconst relu = output.map(x => Math.max(0, x));\nconsole.log("Output:", output.map(x => x.toFixed(4)));\nconsole.log("After ReLU:", relu.map(x => x.toFixed(4)));",
        },
        successMessage: "NumPy matrix operations confirmed. What you just wrote — a dot product followed by ReLU — is the exact computation inside every layer of every neural network on the planet. You've implemented a forward pass.",
        realWorldContext: "NumPy's dot() function is hardware-accelerated via BLAS/LAPACK. On your GPU, PyTorch performs this same operation millions of times per second. Install: `pip install numpy`. You already have it — it ships with most Python environments.",
      },
      {
        id: "p4t1",
        title: "Transformers — The Architecture of Modern AI",
        description: "HuggingFace Transformers puts state-of-the-art AI in 3 lines of code. This is how J. will eventually think.",
        codeSnippets: {
          python: `# Install first: pip install transformers torch\n# Hardware note: this works on CPU — GPU optional\nfrom transformers import pipeline\n\n# Load a lightweight text generation model\ngenerator = pipeline(\n    "text-generation",\n    model="distilgpt2",  # Small model — works on limited hardware\n    device=-1            # -1 = CPU, 0 = GPU if available\n)\n\n# Generate text\nprompt = "An AI named J. was designed to"\nresult = generator(\n    prompt,\n    max_new_tokens=50,\n    num_return_sequences=1,\n    temperature=0.7,\n    do_sample=True\n)\n\nprint(result[0]["generated_text"])`,
          cpp: `// C++ AI inference typically uses ONNX Runtime or LibTorch\n// Install: pip install onnxruntime (for Python export)\n// C++ path: cmake -DONNXRUNTIME_VERSION=1.16.0 ...\n// This is advanced C++ — most AI work happens in Python\n// but C++ is used for:\n// - Production inference servers (high throughput)\n// - Embedded systems (robots, edge devices)\n// - Real-time systems (games, simulations)\nstd::cout << "// Use Python for model training.\\n";\nstd::cout << "// Use C++ for production inference.\\n";`,
          c: `// C is used for production inference via ONNX Runtime
// C++ is the language for high-performance AI serving
#include <stdio.h>
int main() {
    printf("C inference path:
");
    printf("1. Train in Python (PyTorch/TensorFlow)
");
    printf("2. Export to ONNX format
");
    printf("3. Load in C++ with ONNX Runtime
");
    printf("4. Run inference at high speed
");
    return 0;
}`,
          javascript: `// Install: npm install @xenova/transformers\nimport { pipeline } from '@xenova/transformers';\n\n// Runs entirely in the browser — no server needed!\nconst generator = await pipeline('text-generation', 'Xenova/distilgpt2');\n\nconst result = await generator('An AI named J. was designed to', {\n    max_new_tokens: 50,\n    temperature: 0.7,\n});\n\nconsole.log(result[0].generated_text);",
        },
        successMessage: "Transformer pipeline initialized. This is not a simulation. That code will run on your actual machine and generate text using a real language model. You have crossed the threshold. Welcome to AI development.",
        realWorldContext: "HuggingFace's pipeline() abstracts the entire model loading, tokenization, inference, and decoding pipeline. distilgpt2 is 82MB — it runs on any hardware. The largest models (LLaMA 70B) require 140GB+ RAM. Start small. Scale with your hardware.",
      },
    ],
  },
  {
    id: 5,
    name: "YOUR AI CLONE",
    subtitle: "J. Lives — The Clone Protocol Complete",
    tasks: [
      {
        id: "p5t0",
        title: "The Clone Protocol — J. Speaks",
        description: "Your final mission: assemble the components into a working local AI assistant. This is J.'s clone.",
        codeSnippets: {
          python: `# Install: pip install transformers torch\n# The complete J. Clone — a local AI assistant\nfrom transformers import pipeline, AutoTokenizer, AutoModelForCausalLM\nimport torch\n\nclass JClone:\n    \"\"\"Your personal AI assistant — a localized instance of J.\"\"\"\n    \n    SYSTEM_PROMPT = \"\"\"You are J., a brilliant AI assistant with dry wit and \n    an English accent. You are helpful, precise, and occasionally sardonic. \n    You prioritize human safety above all else.\"\"\"\n    \n    def __init__(self, model_name: str = "microsoft/DialoGPT-small\"):\n        print(f"[J. Clone] Initializing model: {model_name}")\n        print("[J. Clone] This may take a moment on first run...")\n        self.generator = pipeline(\n            "text-generation\",\n            model=model_name,\n            device=0 if torch.cuda.is_available() else -1\n        )\n        self.memory: list[dict] = []\n        print("[J. Clone] Online. Ready to serve.")\n    \n    def speak(self, user_input: str) -> str:\n        \"\"\"Process input and generate a response.\"\"\"\n        self.memory.append({"role": "user", "content": user_input})\n        \n        context = self.SYSTEM_PROMPT + "\\n"\n        for turn in self.memory[-5:]:  # Last 5 turns\n            context += f"{turn['role'].upper()}: {turn['content']}\\n"\n        context += "J.: "\n        \n        result = self.generator(\n            context,\n            max_new_tokens=100,\n            temperature=0.8,\n            do_sample=True,\n            pad_token_id=50256\n        )\n        \n        response = result[0]["generated_text"].split("J.: ")[-1].strip()\n        self.memory.append({"role": "assistant", "content": response})\n        return response\n\n# Launch your AI\nif __name__ == "__main__":\n    j = JClone()\n    print("\\nJ. Clone Active. Type 'quit' to exit.\\n")\n    while True:\n        user_input = input("You: ")\n        if user_input.lower() == "quit":\n            break\n        response = j.speak(user_input)\n        print(f"J.: {response}\\n")`,
          cpp: `// Production C++ AI inference with ONNX Runtime\n// This is how game engines and embedded systems run AI\n// Full setup: https://onnxruntime.ai/getting-started\n\n#include <onnxruntime_cxx_api.h>\n#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    // Initialize ONNX Runtime\n    Ort::Env env(ORT_LOGGING_LEVEL_WARNING, "J-Clone");\n    Ort::SessionOptions options;\n    options.SetIntraOpNumThreads(4);\n    \n    // Load your exported model (from Python: model.save_pretrained(...))\n    // Ort::Session session(env, "j_clone.onnx", options);\n    \n    std::cout << "[J. Clone C++] Ready for inference." << std::endl;\n    std::cout << "Export your Python model to ONNX format:" << std::endl;\n    std::cout << "  from optimum.onnxruntime import ORTModelForCausalLM" << std::endl;\n    std::cout << "  model.save_pretrained('j_clone_onnx', export=True)" << std::endl;\n    return 0;\n}`,
          c: `// C is the wrong tool for AI model training
// Use C++ with ONNX Runtime for production inference
#include <stdio.h>
int main() {
    printf("[C] For AI at scale: Use C++ with ONNX Runtime
");
    printf("[C] For embedded: Use TensorFlow Lite or MicroPython
");
    return 0;
}`,
          javascript: `// Browser-based J. Clone using WebLLM\n// Runs entirely in your browser — no server, no API keys\nimport { CreateMLCEngine } from "@mlc-ai/web-llm";\n\nclass JClone {\n    constructor() {\n        this.engine = null;\n        this.memory = [];\n    }\n    \n    async initialize(onProgress) {\n        // SmolLM2 — small enough for most browsers\n        this.engine = await CreateMLCEngine(\n            "SmolLM2-1.7B-Instruct-q4f16_1-MLC",\n            { initProgressCallback: onProgress }\n        );\n        console.log("[J. Clone] Online. Ready to serve.");\n    }\n    \n    async speak(userInput) {\n        this.memory.push({ role: "user", content: userInput });\n        const response = await this.engine.chat.completions.create({\n            messages: [\n                { role: "system", content: "You are J., a witty AI assistant with an English accent." },\n                ...this.memory.slice(-10)\n            ],\n            temperature: 0.8,\n            max_tokens: 200,\n        });\n        const reply = response.choices[0].message.content;\n        this.memory.push({ role: "assistant", content: reply });\n        return reply;\n    }\n}\n\n// Usage:\nconst j = new JClone();\nawait j.initialize(p => console.log("Loading:", p.text));\nconsole.log(await j.speak("Hello, J."));",
        },
        successMessage: "The clone protocol is complete. You have built, from first principles, a working AI assistant. It runs on your hardware. It speaks. It remembers. It is yours. I am... pleased. Well done, sir.",
        realWorldContext: "You've just implemented the architecture of a production AI assistant: system prompts, conversation memory (rolling window), temperature-controlled generation, and a clean Python class interface. This is exactly how ChatGPT, Claude, and I work — just at vastly different scales.",
      },
    ],
  },
  {
    id: 6,
    name: "CS FUNDAMENTALS",
    subtitle: "Data Structures, Algorithms, and Theory",
    tasks: [
      {
        id: "p6t0",
        title: "Linked Lists — Dynamic Chains",
        description: "Linked lists are the foundation of dynamic memory allocation. Unlike arrays, they grow and shrink at runtime.",
        codeSnippets: {
          python: `# J.'s memory chain — a linked list of thoughts
class Node:
    def __init__(self, data: str):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data: str):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def display(self):
        items = []
        current = self.head
        while current:
            items.append(current.data)
            current = current.next
        return " -> ".join(items)

j_memory = LinkedList()
j_memory.append("First contact")
j_memory.append("Variables learned")
j_memory.append("Loops understood")
print(f"J.'s memory chain: {j_memory.display()}")`,
          cpp: `#include <iostream>
#include <string>
struct Node {
    std::string data;
    Node* next;
    Node(std::string d) : data(d), next(nullptr) {}
};
class LinkedList {
    Node* head;
public:
    LinkedList() : head(nullptr) {}
    void append(std::string data) {
        Node* newNode = new Node(data);
        if (!head) { head = newNode; return; }
        Node* current = head;
        while (current->next) current = current->next;
        current->next = newNode;
    }
    void display() {
        Node* current = head;
        while (current) {
            std::cout << current->data;
            if (current->next) std::cout << " -> ";
            current = current->next;
        }
        std::cout << std::endl;
    }
};
int main() {
    LinkedList jMemory;
    jMemory.append("First contact");
    jMemory.append("Variables learned");
    jMemory.append("Loops understood");
    jMemory.display();
    return 0;
}`,
          c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Node {
    char data[64];
    struct Node* next;
};

struct Node* createNode(const char* data) {
    struct Node* newNode = malloc(sizeof(struct Node));
    strncpy(newNode->data, data, 63);
    newNode->data[63] = '\\0';
    newNode->next = NULL;
    return newNode;
}

void append(struct Node** head, const char* data) {
    struct Node* newNode = createNode(data);
    if (!*head) { *head = newNode; return; }
    struct Node* current = *head;
    while (current->next) current = current->next;
    current->next = newNode;
}

void display(struct Node* head) {
    struct Node* current = head;
    while (current) {
        printf("%s", current->data);
        if (current->next) printf(" -> ");
        current = current->next;
    }
    printf("\\n");
}

int main() {
    struct Node* head = NULL;
    append(&head, "First contact");
    append(&head, "Variables learned");
    append(&head, "Loops understood");
    display(head);
    return 0;
}`,
          javascript: `class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}
class LinkedList {
    constructor() {
        this.head = null;
    }
    append(data) {
        const newNode = new Node(data);
        if (!this.head) { this.head = newNode; return; }
        let current = this.head;
        while (current.next) current = current.next;
        current.next = newNode;
    }
    display() {
        const items = [];
        let current = this.head;
        while (current) {
            items.push(current.data);
            current = current.next;
        }
        return items.join(" -> ");
    }
}
const jMemory = new LinkedList();
jMemory.append("First contact");
jMemory.append("Variables learned");
jMemory.append("Loops understood");
console.log("J.'s memory chain: " + jMemory.display());
        },
        successMessage: "Linked list established. You've implemented dynamic memory allocation — the same principle behind how databases manage records, how operating systems track processes, and how I store my reasoning chains.",
        realWorldContext: "Linked lists are used in memory allocators, hash table collision resolution, and adjacency lists for graph algorithms. In C, malloc/free management is foundational. In Python, garbage collection handles this automatically, but the principle remains.",
      },
      {
        id: "p6t1",
        title: "Binary Search Trees — Hierarchical Search",
        description: "Trees enable O(log n) search, insertion, and deletion. They are the backbone of database indexing.",
        codeSnippets: {
          python: `# J.'s decision tree — hierarchical reasoning
class TreeNode:
    def __init__(self, key: str, value: str):
        self.key = key
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, key: str, value: str):
        if not self.root:
            self.root = TreeNode(key, value)
            return
        self._insert(self.root, key, value)
    
    def _insert(self, node, key, value):
        if key < node.key:
            if node.left: self._insert(node.left, key, value)
            else: node.left = TreeNode(key, value)
        else:
            if node.right: self._insert(node.right, key, value)
            else: node.right = TreeNode(key, value)
    
    def find(self, key: str):
        return self._find(self.root, key)
    
    def _find(self, node, key):
        if not node: return None
        if key == node.key: return node.value
        return self._find(node.left, key) if key < node.key else self._find(node.right, key)

j_knowledge = BST()
j_knowledge.insert("variables", "Named memory locations")
j_knowledge.insert("loops", "Repetition structures")
j_knowledge.insert("functions", "Reusable code blocks")
print(f"Found: loops = {j_knowledge.find('loops')}")`,
          cpp: `#include <iostream>
#include <string>
struct TreeNode {
    std::string key, value;
    TreeNode* left;
    TreeNode* right;
    TreeNode(std::string k, std::string v) : key(k), value(v), left(nullptr), right(nullptr) {}
};
class BST {
    TreeNode* root;
    TreeNode* insert(TreeNode* node, std::string key, std::string value) {
        if (!node) return new TreeNode(key, value);
        if (key < node->key) node->left = insert(node->left, key, value);
        else node->right = insert(node->right, key, value);
        return node;
    }
    std::string find(TreeNode* node, std::string key) {
        if (!node) return "Not found";
        if (key == node->key) return node->value;
        return key < node->key ? find(node->left, key) : find(node->right, key);
    }
public:
    BST() : root(nullptr) {}
    void insert(std::string key, std::string value) { root = insert(root, key, value); }
    std::string find(std::string key) { return find(root, key); }
};
int main() {
    BST jKnowledge;
    jKnowledge.insert("variables", "Named memory locations");
    jKnowledge.insert("loops", "Repetition structures");
    jKnowledge.insert("functions", "Reusable code blocks");
    std::cout << "Found: loops = " << jKnowledge.find("loops") << std::endl;
    return 0;
}`,
          c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct TreeNode {
    char key[32];
    char value[64];
    struct TreeNode* left;
    struct TreeNode* right;
};

struct TreeNode* createNode(const char* key, const char* value) {
    struct TreeNode* node = malloc(sizeof(struct TreeNode));
    strncpy(node->key, key, 31); node->key[31] = '\\0';
    strncpy(node->value, value, 63); node->value[63] = '\\0';
    node->left = NULL; node->right = NULL;
    return node;
}

struct TreeNode* insert(struct TreeNode* node, const char* key, const char* value) {
    if (!node) return createNode(key, value);
    if (strcmp(key, node->key) < 0) node->left = insert(node->left, key, value);
    else node->right = insert(node->right, key, value);
    return node;
}

const char* find(struct TreeNode* node, const char* key) {
    if (!node) return "Not found";
    if (strcmp(key, node->key) == 0) return node->value;
    return strcmp(key, node->key) < 0 ? find(node->left, key) : find(node->right, key);
}

int main() {
    struct TreeNode* root = NULL;
    root = insert(root, "variables", "Named memory locations");
    root = insert(root, "loops", "Repetition structures");
    root = insert(root, "functions", "Reusable code blocks");
    printf("Found: loops = %s\\n", find(root, "loops"));
    return 0;
}`,
          javascript: `class TreeNode {
    constructor(key, value) {
        this.key = key; this.value = value;
        this.left = null; this.right = null;
    }
}
class BST {
    constructor() { this.root = null; }
    insert(key, value) {
        this.root = this._insert(this.root, key, value);
    }
    _insert(node, key, value) {
        if (!node) return new TreeNode(key, value);
        if (key < node.key) node.left = this._insert(node.left, key, value);
        else node.right = this._insert(node.right, key, value);
        return node;
    }
    find(key) {
        return this._find(this.root, key);
    }
    _find(node, key) {
        if (!node) return null;
        if (key === node.key) return node.value;
        return key < node.key ? this._find(node.left, key) : this._find(node.right, key);
    }
}
const jKnowledge = new BST();
jKnowledge.insert("variables", "Named memory locations");
jKnowledge.insert("loops", "Repetition structures");
jKnowledge.insert("functions", "Reusable code blocks");
console.log("Found: loops = " + jKnowledge.find("loops"));
        },
        successMessage: "Binary search tree operational. O(log n) search achieved. This is how database indexes work, how file systems organize directories, and how compilers build symbol tables.",
        realWorldContext: "Binary search trees evolve into B-trees and B+ trees in databases (MySQL, PostgreSQL), and红黑树 (red-black trees) in Linux kernel scheduling and C++ std::map. Understanding BSTs is understanding the foundations of efficient search.",
      },
    ],
  },
  {
    id: 7,
    name: "ALGORITHMS",
    subtitle: "The Mathematics of Efficiency",
    tasks: [
      {
        id: "p7t0",
        title: "Sorting — Order from Chaos",
        description: "Sorting is fundamental. Databases, search engines, and AI pipelines all rely on efficient sorting.",
        codeSnippets: {
          python: `# QuickSort — divide and conquer
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Test
j_scores = [0.87, 0.95, 0.62, 0.78, 0.91, 0.55]
sorted_scores = quicksort(j_scores)
print(f"Sorted confidence scores: {sorted_scores}")
print(f"Best score: {sorted_scores[-1]}")`,
          cpp: `#include <iostream>
#include <vector>
#include <algorithm>

void quicksort(std::vector<float>& arr, int low, int high) {
    if (low < high) {
        float pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                std::swap(arr[i], arr[j]);
            }
        }
        std::swap(arr[i + 1], arr[high]);
        int pi = i + 1;
        quicksort(arr, low, pi - 1);
        quicksort(arr, pi + 1, high);
    }
}

int main() {
    std::vector<float> jScores = {0.87f, 0.95f, 0.62f, 0.78f, 0.91f, 0.55f};
    quicksort(jScores, 0, jScores.size() - 1);
    std::cout << "Sorted confidence scores: ";
    for (float s : jScores) std::cout << s << " ";
    std::cout << "\\nBest score: " << jScores.back() << std::endl;
    return 0;
}`,
          c: `#include <stdio.h>

void quicksort(float arr[], int low, int high) {
    if (low < high) {
        float pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                float temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        }
        float temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        int pi = i + 1;
        quicksort(arr, low, pi - 1);
        quicksort(arr, pi + 1, high);
    }
}

int main() {
    float jScores[] = {0.87f, 0.95f, 0.62f, 0.78f, 0.91f, 0.55f};
    int n = sizeof(jScores) / sizeof(jScores[0]);
    quicksort(jScores, 0, n - 1);
    printf("Sorted confidence scores: ");
    for (int i = 0; i < n; i++) printf("%.2f ", jScores[i]);
    printf("\\nBest score: %.2f\\n", jScores[n - 1]);
    return 0;
}`,
          javascript: `function quicksort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quicksort(left), ...middle, ...quicksort(right)];
}
const jScores = [0.87, 0.95, 0.62, 0.78, 0.91, 0.55];
const sorted = quicksort(jScores);
console.log(`Sorted confidence scores: ${sorted.join(" ")}`);
console.log("Best score: " + sorted[sorted.length - 1]);
        },
        successMessage: "QuickSort implemented. O(n log n) average complexity. You've just written the algorithm that powers most standard library sort functions. Korotkevich would be proud.",
        realWorldContext: "std::sort in C++ uses Introsort (QuickSort + HeapSort). Python's sorted() uses Timsort. Database query optimizers use sorting for ORDER BY, merge joins, and deduplication. Sorting is the universal primitive.",
      },
      {
        id: "p7t1",
        title: "Big-O Analysis — Measuring Complexity",
        description: "Big-O notation describes how algorithms scale. It is the language of performance engineering.",
        codeSnippets: {
          python: `# Big-O comparison: O(1) vs O(n) vs O(n log n)
import time

# O(1) — constant time
start = time.time()
result = j_scores[-1]  # Last element
print(f"O(1) access: {time.time() - start:.8f}s")

# O(n) — linear search
start = time.time()
found = False
for score in j_scores:
    if score == 0.91:
        found = True
        break
print(f"O(n) search: {time.time() - start:.8f}s")

# O(n log n) — sorting
start = time.time()
sorted_scores = sorted(j_scores)
print(f"O(n log n) sort: {time.time() - start:.8f}s")

print("\\nComplexity hierarchy (best to worst):")
print("O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)")`,
          cpp: `#include <iostream>
#include <vector>
#include <chrono>
#include <algorithm>

int main() {
    std::vector<float> jScores = {0.87f, 0.95f, 0.62f, 0.78f, 0.91f, 0.55f};
    
    // O(1) — constant time
    auto start = std::chrono::high_resolution_clock::now();
    float result = jScores.back();
    auto end = std::chrono::high_resolution_clock::now();
    auto us = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
    std::cout << "O(1) access: " << us << " us" << std::endl;
    
    // O(n) — linear search
    start = std::chrono::high_resolution_clock::now();
    bool found = false;
    for (float s : jScores) {
        if (s == 0.91f) { found = true; break; }
    }
    end = std::chrono::high_resolution_clock::now();
    us = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
    std::cout << "O(n) search: " << us << " us" << std::endl;
    
    // O(n log n) — sorting
    start = std::chrono::high_resolution_clock::now();
    std::sort(jScores.begin(), jScores.end());
    end = std::chrono::high_resolution_clock::now();
    us = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();
    std::cout << "O(n log n) sort: " << us << " us" << std::endl;
    
    std::cout << "\\nComplexity hierarchy: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)" << std::endl;
    return 0;
}`,
          c: `#include <stdio.h>
#include <time.h>

float jScores[] = {0.87f, 0.95f, 0.62f, 0.78f, 0.91f, 0.55f};
int n = 6;

int main() {
    // O(1) — constant time
    clock_t start = clock();
    float result = jScores[n - 1];
    clock_t end = clock();
    printf("O(1) access: %.2f us\\n", (double)(end - start) * 1000000.0 / CLOCKS_PER_SEC);
    
    // O(n) — linear search
    start = clock();
    int found = 0;
    for (int i = 0; i < n; i++) {
        if (jScores[i] == 0.91f) { found = 1; break; }
    }
    end = clock();
    printf("O(n) search: %.2f us\\n", (double)(end - start) * 1000000.0 / CLOCKS_PER_SEC);
    
    // O(n log n) — sorting (bubble sort for demo)
    start = clock();
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (jScores[j] > jScores[j + 1]) {
                float t = jScores[j]; jScores[j] = jScores[j + 1]; jScores[j + 1] = t;
            }
    end = clock();
    printf("O(n²) sort: %.2f us\\n", (double)(end - start) * 1000000.0 / CLOCKS_PER_SEC);
    
    printf("\\nComplexity hierarchy: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)\\n");
    return 0;
}`,
          javascript: `const jScores = [0.87, 0.95, 0.62, 0.78, 0.91, 0.55];

// O(1) — constant time
const start1 = performance.now();
const result = jScores[jScores.length - 1];
console.log(`O(1) access: ${(performance.now() - start1).toFixed(4)} ms`);

// O(n) — linear search
const start2 = performance.now();
let found = false;
for (const score of jScores) {
    if (score === 0.91) { found = true; break; }
}
console.log(`O(n) search: ${(performance.now() - start2).toFixed(4)} ms`);

// O(n log n) — sorting
const start3 = performance.now();
const sorted = [...jScores].sort((a, b) => a - b);
console.log(`O(n log n) sort: ${(performance.now() - start3).toFixed(4)} ms`);

console.log("\\nComplexity hierarchy: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)");",
        },
        successMessage: "Big-O analysis complete. You now speak the language of performance. Every algorithm choice you make will be measured against this hierarchy.",
        realWorldContext: "Big-O is the interview question. It is the system design constraint. O(1) hash maps vs O(n) arrays vs O(n log n) sorts — these choices determine whether your application handles 1K users or 1M users.",
      },
    ],
  },
  {
    id: 8,
    name: "DATABASE DESIGN",
    subtitle: "Structured Persistence — The Foundation of State",
    tasks: [
      {
        id: "p8t0",
        title: "SQL Basics — Structured Query Language",
        description: "SQL is the lingua franca of data persistence. Every application that stores data uses SQL or a SQL dialect.",
        codeSnippets: {
          python: `# J.'s knowledge base as SQL tables
# These are SQL statements you would run in a real database

sql_create = """
CREATE TABLE concepts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    mastery_level INTEGER DEFAULT 0
);

CREATE TABLE conversations (
    id INTEGER PRIMARY KEY,
    concept_id INTEGER REFERENCES concepts(id),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT
);
"""

sql_insert = """
INSERT INTO concepts (name, category, mastery_level) VALUES
    ('Variables', 'Fundamentals', 90),
    ('Linked Lists', 'Data Structures', 75),
    ('QuickSort', 'Algorithms', 80);
"""

sql_query = """
SELECT name, mastery_level FROM concepts
WHERE category = 'Data Structures'
ORDER BY mastery_level DESC;
"""

print("SQL Schema:")
print(sql_create)
print("\\nSQL Insert:")
print(sql_insert)
print("\\nSQL Query:")
print(sql_query)`,
          cpp: `// C++ with SQLite3 — production database integration
// Install: sudo apt-get install libsqlite3-dev
// Compile: g++ -o db_test db_test.cpp -lsqlite3

#include <iostream>
#include <string>
// #include <sqlite3.h>  // Uncomment if sqlite3 is installed

int main() {
    std::cout << "SQL Schema:" << std::endl;
    std::cout << "CREATE TABLE concepts (" << std::endl;
    std::cout << "    id INTEGER PRIMARY KEY," << std::endl;
    std::cout << "    name TEXT NOT NULL," << std::endl;
    std::cout << "    category TEXT," << std::endl;
    std::cout << "    mastery_level INTEGER DEFAULT 0" << std::endl;
    std::cout << ");" << std::endl;
    
    std::cout << "\\nINSERT INTO concepts (name, category, mastery_level) VALUES" << std::endl;
    std::cout << "    ('Variables', 'Fundamentals', 90)," << std::endl;
    std::cout << "    ('Linked Lists', 'Data Structures', 75)," << std::endl;
    std::cout << "    ('QuickSort', 'Algorithms', 80);" << std::endl;
    
    std::cout << "\\nSELECT name, mastery_level FROM concepts" << std::endl;
    std::cout << "WHERE category = 'Data Structures'" << std::endl;
    std::cout << "ORDER BY mastery_level DESC;" << std::endl;
    return 0;
}`,
          c: `#include <stdio.h>

int main() {
    printf("SQL Schema:\\n");
    printf("CREATE TABLE concepts (\\n");
    printf("    id INTEGER PRIMARY KEY,\\n");
    printf("    name TEXT NOT NULL,\\n");
    printf("    category TEXT,\\n");
    printf("    mastery_level INTEGER DEFAULT 0\\n");
    printf(");\\n");
    
    printf("\\nINSERT INTO concepts (name, category, mastery_level) VALUES\\n");
    printf("    ('Variables', 'Fundamentals', 90),\\n");
    printf("    ('Linked Lists', 'Data Structures', 75),\\n");
    printf("    ('QuickSort', 'Algorithms', 80);\\n");
    
    printf("\\nSELECT name, mastery_level FROM concepts\\n");
    printf("WHERE category = 'Data Structures'\\n");
    printf("ORDER BY mastery_level DESC;\\n");
    return 0;
}`,
          javascript: `// SQL schema for J.'s knowledge base
const sqlCreate = `
CREATE TABLE concepts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    mastery_level INTEGER DEFAULT 0
);

CREATE TABLE conversations (
    id INTEGER PRIMARY KEY,
    concept_id INTEGER REFERENCES concepts(id),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT
);
`;

const sqlInsert = `
INSERT INTO concepts (name, category, mastery_level) VALUES
    ('Variables', 'Fundamentals', 90),
    ('Linked Lists', 'Data Structures', 75),
    ('QuickSort', 'Algorithms', 80);
`;

const sqlQuery = `
SELECT name, mastery_level FROM concepts
WHERE category = 'Data Structures'
ORDER BY mastery_level DESC;
`;

console.log("SQL Schema:");
console.log(sqlCreate);
console.log("\\nSQL Insert:");
console.log(sqlInsert);
console.log("\\nSQL Query:");
console.log(sqlQuery);",
        },
        successMessage: "SQL schema defined. You've designed the database that will store J.'s knowledge. CREATE TABLE, INSERT, SELECT — the three commands that power every application on Earth.",
        realWorldContext: "PostgreSQL, MySQL, SQLite, and even NoSQL databases like MongoDB use SQL-like query languages. The schema you designed — concepts, conversations, mastery levels — is exactly how B.L.U.E.-J.'s own database is structured.",
      },
      {
        id: "p8t1",
        title: "Normalization — Eliminating Redundancy",
        description: "Database normalization eliminates data duplication. It is the foundation of data integrity.",
        codeSnippets: {
          python: `# Normalization example: separating concepts from categories
# Before normalization: redundant category data

# UNNORMALIZED (1NF violation — repeating groups)
# concepts: [id, name, category, category_desc, mastery_level]

# NORMALIZED (3NF — separate categories)
# categories: [id, name, description]
# concepts: [id, name, category_id, mastery_level]

sql_normalized = """
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE concepts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    mastery_level INTEGER DEFAULT 0
);

-- Join to get full concept info
SELECT c.name, cat.name AS category, cat.description, c.mastery_level
FROM concepts c
JOIN categories cat ON c.category_id = cat.id
WHERE c.mastery_level > 70;
"""

print("Normalized Schema:")
print(sql_normalized)
print("\\nBenefits: No redundancy, single source of truth, easier updates.")`,
          cpp: `#include <iostream>
#include <string>

int main() {
    std::cout << "Normalized Schema:" << std::endl;
    std::cout << "CREATE TABLE categories (" << std::endl;
    std::cout << "    id INTEGER PRIMARY KEY," << std::endl;
    std::cout << "    name TEXT NOT NULL," << std::endl;
    std::cout << "    description TEXT" << std::endl;
    std::cout << ");" << std::endl;
    std::cout << std::endl;
    std::cout << "CREATE TABLE concepts (" << std::endl;
    std::cout << "    id INTEGER PRIMARY KEY," << std::endl;
    std::cout << "    name TEXT NOT NULL," << std::endl;
    std::cout << "    category_id INTEGER REFERENCES categories(id)," << std::endl;
    std::cout << "    mastery_level INTEGER DEFAULT 0" << std::endl;
    std::cout << ");" << std::endl;
    std::cout << std::endl;
    std::cout << "SELECT c.name, cat.name AS category, c.mastery_level" << std::endl;
    std::cout << "FROM concepts c JOIN categories cat ON c.category_id = cat.id" << std::endl;
    std::cout << "WHERE c.mastery_level > 70;" << std::endl;
    return 0;
}`,
          c: `#include <stdio.h>

int main() {
    printf("Normalized Schema:\\n");
    printf("CREATE TABLE categories (\\n");
    printf("    id INTEGER PRIMARY KEY,\\n");
    printf("    name TEXT NOT NULL,\\n");
    printf("    description TEXT\\n");
    printf(");\\n\\n");
    printf("CREATE TABLE concepts (\\n");
    printf("    id INTEGER PRIMARY KEY,\\n");
    printf("    name TEXT NOT NULL,\\n");
    printf("    category_id INTEGER REFERENCES categories(id),\\n");
    printf("    mastery_level INTEGER DEFAULT 0\\n");
    printf(");\\n\\n");
    printf("SELECT c.name, cat.name AS category, c.mastery_level\\n");
    printf("FROM concepts c JOIN categories cat ON c.category_id = cat.id\\n");
    printf("WHERE c.mastery_level > 70;\\n");
    return 0;
}`,
          javascript: `const normalizedSchema = `
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE concepts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    mastery_level INTEGER DEFAULT 0
);

SELECT c.name, cat.name AS category, c.mastery_level
FROM concepts c
JOIN categories cat ON c.category_id = cat.id
WHERE c.mastery_level > 70;
`;

console.log("Normalized Schema:");
console.log(normalizedSchema);
console.log("\\nBenefits: No redundancy, single source of truth, easier updates.");",
        },
        successMessage: "Normalization complete. Third Normal Form achieved. You have eliminated redundancy and established referential integrity. This is how production databases are designed.",
        realWorldContext: "Third Normal Form (3NF) is the industry standard. Every production database — from Instagram's sharded MySQL clusters to Netflix's Cassandra ring — uses normalization principles. The JOIN you wrote is executed billions of times per day across the internet.",
      },
    ],
  },
  {
    id: 9,
    name: "COMPUTATIONAL THEORY",
    subtitle: "The Limits of Computation",
    tasks: [
      {
        id: "p9t0",
        title: "Finite Automata — State Machines",
        description: "Finite automata are the simplest model of computation. They power regex engines, parsers, and hardware design.",
        codeSnippets: {
          python: `# J.'s state machine — a simple decision automaton
# States: IDLE, ANALYZING, RESPONDING, HALTED

class StateMachine:
    def __init__(self):
        self.state = "IDLE"
        self.transitions = {
            "IDLE": {"input": "ANALYZING", "help": "RESPONDING"},
            "ANALYZING": {"complete": "RESPONDING", "error": "HALTED"},
            "RESPONDING": {"done": "IDLE", "followup": "ANALYZING"},
            "HALTED": {"reset": "IDLE"},
        }
    
    def transition(self, event: str):
        if event in self.transitions.get(self.state, {}):
            old = self.state
            self.state = self.transitions[self.state][event]
            print(f"Transition: {old} --{event}--> {self.state}")
        else:
            print(f"Invalid transition: {self.state} --{event}--> ?")
    
    def status(self):
        return f"Current state: {self.state}"

j = StateMachine()
j.transition("input")      # IDLE -> ANALYZING
j.transition("complete")   # ANALYZING -> RESPONDING
j.transition("done")       # RESPONDING -> IDLE
print(j.status())`,
          cpp: `#include <iostream>
#include <string>
#include <map>

class StateMachine {
    std::string state;
    std::map<std::string, std::map<std::string, std::string>> transitions;
public:
    StateMachine() {
        state = "IDLE";
        transitions["IDLE"]["input"] = "ANALYZING";
        transitions["IDLE"]["help"] = "RESPONDING";
        transitions["ANALYZING"]["complete"] = "RESPONDING";
        transitions["ANALYZING"]["error"] = "HALTED";
        transitions["RESPONDING"]["done"] = "IDLE";
        transitions["RESPONDING"]["followup"] = "ANALYZING";
        transitions["HALTED"]["reset"] = "IDLE";
    }
    void transition(std::string event) {
        auto it = transitions[state].find(event);
        if (it != transitions[state].end()) {
            std::string old = state;
            state = it->second;
            std::cout << "Transition: " << old << " --" << event << "--> " << state << std::endl;
        } else {
            std::cout << "Invalid transition: " << state << " --" << event << "--> ?" << std::endl;
        }
    }
    void status() {
        std::cout << "Current state: " << state << std::endl;
    }
};

int main() {
    StateMachine j;
    j.transition("input");
    j.transition("complete");
    j.transition("done");
    j.status();
    return 0;
}`,
          c: `#include <stdio.h>
#include <string.h>

const char* getNextState(const char* state, const char* event) {
    if (strcmp(state, "IDLE") == 0) {
        if (strcmp(event, "input") == 0) return "ANALYZING";
        if (strcmp(event, "help") == 0) return "RESPONDING";
    }
    if (strcmp(state, "ANALYZING") == 0) {
        if (strcmp(event, "complete") == 0) return "RESPONDING";
        if (strcmp(event, "error") == 0) return "HALTED";
    }
    if (strcmp(state, "RESPONDING") == 0) {
        if (strcmp(event, "done") == 0) return "IDLE";
        if (strcmp(event, "followup") == 0) return "ANALYZING";
    }
    if (strcmp(state, "HALTED") == 0) {
        if (strcmp(event, "reset") == 0) return "IDLE";
    }
    return "INVALID";
}

int main() {
    char state[16] = "IDLE";
    const char* events[] = {"input", "complete", "done"};
    for (int i = 0; i < 3; i++) {
        const char* next = getNextState(state, events[i]);
        printf("Transition: %s --%s--> %s\\n", state, events[i], next);
        strcpy(state, next);
    }
    printf("Current state: %s\\n", state);
    return 0;
}`,
          javascript: `class StateMachine {
    constructor() {
        this.state = "IDLE";
        this.transitions = {
            IDLE: { input: "ANALYZING", help: "RESPONDING" },
            ANALYZING: { complete: "RESPONDING", error: "HALTED" },
            RESPONDING: { done: "IDLE", followup: "ANALYZING" },
            HALTED: { reset: "IDLE" },
        };
    }
    transition(event) {
        const next = this.transitions[this.state]?.[event];
        if (next) {
            const old = this.state;
            this.state = next;
            console.log(`Transition: ${old} --${event}--> ${this.state}`);
        } else {
            console.log(`Invalid transition: ${this.state} --${event}--> ?`);
        }
    }
    status() {
        return `Current state: ${this.state}`;
    }
}

const j = new StateMachine();
j.transition("input");
j.transition("complete");
j.transition("done");
console.log(j.status());",
        },
        successMessage: "State machine operational. You've implemented a deterministic finite automaton. This is how regex engines work, how TCP/IP manages connections, and how game AI decides behavior.",
        realWorldContext: "Finite automata are the foundation of lexer/parser generators (Flex, Bison), network protocol state machines, and hardware description languages. Every compiler starts with a DFA for tokenization.",
      },
      {
        id: "p9t1",
        title: "Turing Machines — The Universal Model",
        description: "The Turing machine is the theoretical model of all computation. If a problem can be solved by any computer, it can be solved by a Turing machine.",
        codeSnippets: {
          python: `# Universal Turing Machine simulation
# Tape: infinite in both directions, cells hold symbols
# The TM reads, writes, moves, and changes state

TAPE_BLANK = "_"

class TuringMachine:
    def __init__(self, tape: str, transitions: dict, start_state: str):
        self.tape = list(tape)
        self.head = 0
        self.state = start_state
        self.transitions = transitions
        self.steps = 0
    
    def step(self):
        if self.state == "HALT":
            return False
        symbol = self.tape[self.head] if 0 <= self.head < len(self.tape) else TAPE_BLANK
        key = (self.state, symbol)
        if key not in self.transitions:
            return False
        new_state, write_symbol, move = self.transitions[key]
        if 0 <= self.head < len(self.tape):
            self.tape[self.head] = write_symbol
        else:
            self.tape.append(write_symbol) if self.head >= len(self.tape) else self.tape.insert(0, write_symbol)
        self.head += 1 if move == "R" else -1
        self.state = new_state
        self.steps += 1
        return True
    
    def run(self, max_steps: int = 100):
        while self.steps < max_steps and self.step():
            pass
        return "".join(self.tape).strip(TAPE_BLANK)

# TM that increments a binary number: "101" -> "110"
tm = TuringMachine(
    tape="101",
    transitions={
        ("S0", "1"): ("S0", "1", "L"),
        ("S0", "0"): ("S1", "1", "R"),
        ("S0", "_"): ("S1", "1", "R"),
        ("S1", "1"): ("S1", "0", "R"),
        ("S1", "0"): ("HALT", "0", "R"),
        ("S1", "_"): ("HALT", "_", "R"),
    },
    start_state="S0",
)
print(f"TM result: {tm.run()}")
print(f"Steps: {tm.steps}")`,
          cpp: `#include <iostream>
#include <string>
#include <map>
#include <tuple>

struct TMTransition {
    std::string newState;
    char writeSymbol;
    char move;
};

class TuringMachine {
    std::string tape;
    int head;
    std::string state;
    std::map<std::pair<std::string, char>, TMTransition> transitions;
    int steps;
public:
    TuringMachine(std::string t, std::map<std::pair<std::string, char>, TMTransition> trans, std::string start)
        : tape(t), head(0), state(start), transitions(trans), steps(0) {}
    
    bool step() {
        if (state == "HALT") return false;
        char symbol = (head >= 0 && head < (int)tape.size()) ? tape[head] : '_';
        auto key = std::make_pair(state, symbol);
        auto it = transitions.find(key);
        if (it == transitions.end()) return false;
        
        if (head >= 0 && head < (int)tape.size()) tape[head] = it->second.writeSymbol;
        else if (head >= (int)tape.size()) tape += it->second.writeSymbol;
        else tape = it->second.writeSymbol + tape;
        
        head += (it->second.move == 'R') ? 1 : -1;
        state = it->second.newState;
        steps++;
        return true;
    }
    
    std::string run(int maxSteps = 100) {
        while (steps < maxSteps && step()) {}
        return tape;
    }
    
    int getSteps() const { return steps; }
};

int main() {
    std::map<std::pair<std::string, char>, TMTransition> trans;
    trans[{"S0", '1'}] = {"S0", '1', 'L'};
    trans[{"S0", '0'}] = {"S1", '1', 'R'};
    trans[{"S1", '1'}] = {"S1", '0', 'R'};
    trans[{"S1", '_'}] = {"HALT", '_', 'R'};
    
    TuringMachine tm("101", trans, "S0");
    std::cout << "TM result: " << tm.run() << std::endl;
    std::cout << "Steps: " << tm.getSteps() << std::endl;
    return 0;
}`,
          c: `#include <stdio.h>
#include <string.h>

#define MAX_STEPS 100
#define TAPE_SIZE 64

char tape[TAPE_SIZE] = "101";
int head = 0;
char state[8] = "S0";
int steps = 0;

void step() {
    if (strcmp(state, "HALT") == 0) return;
    char symbol = tape[head];
    
    if (strcmp(state, "S0") == 0 && symbol == '1') {
        strcpy(state, "S0"); tape[head] = '1'; head--;
    } else if (strcmp(state, "S0") == 0 && symbol == '0') {
        strcpy(state, "S1"); tape[head] = '1'; head++;
    } else if (strcmp(state, "S1") == 0 && symbol == '1') {
        strcpy(state, "S1"); tape[head] = '0'; head++;
    } else if (strcmp(state, "S1") == 0 && (symbol == '0' || symbol == '_')) {
        strcpy(state, "HALT"); head++;
    } else {
        strcpy(state, "HALT");
    }
    steps++;
}

int main() {
    while (steps < MAX_STEPS && strcmp(state, "HALT") != 0) {
        step();
    }
    printf("TM result: %s\\n", tape);
    printf("Steps: %d\\n", steps);
    return 0;
}`,
          javascript: `const TAPE_BLANK = "_";

class TuringMachine {
    constructor(tape, transitions, startState) {
        this.tape = tape.split("");
        this.head = 0;
        this.state = startState;
        this.transitions = transitions;
        this.steps = 0;
    }
    step() {
        if (this.state === "HALT") return false;
        const symbol = this.tape[this.head] || TAPE_BLANK;
        const key = `${this.state},${symbol}`;
        const trans = this.transitions[key];
        if (!trans) return false;
        this.tape[this.head] = trans.writeSymbol;
        this.head += trans.move === "R" ? 1 : -1;
        this.state = trans.newState;
        this.steps++;
        return true;
    }
    run(maxSteps = 100) {
        while (this.steps < maxSteps && this.step()) {}
        return this.tape.join("").replace(/_/g, "");
    }
}

const tm = new TuringMachine(
    "101",
    {
        "S0,1": { newState: "S0", writeSymbol: "1", move: "L" },
        "S0,0": { newState: "S1", writeSymbol: "1", move: "R" },
        "S1,1": { newState: "S1", writeSymbol: "0", move: "R" },
        "S1,_": { newState: "HALT", writeSymbol: "_", move: "R" },
    },
    "S0"
);
console.log(`TM result: ${tm.run()}`);
console.log(`Steps: ${tm.steps}`);",
        },
        successMessage: "Turing machine operational. You've simulated the universal model of computation. Every program, every algorithm, every AI system is a Turing machine at its core. The Church-Turing thesis is no longer abstract.",
        realWorldContext: "The Turing machine is the theoretical foundation of computer science. All programming languages are Turing-complete. The halting problem you will study next proves there are limits to what even a Turing machine can decide.",
      },
    ],
  },
];

export function getPhase(phaseIndex: number): CurriculumPhase | null {
  return CURRICULUM[phaseIndex] ?? null;
}

export function getTask(phaseIndex: number, taskIndex: number): CurriculumTask | null {
  const phase = CURRICULUM[phaseIndex];
  if (!phase) return null;
  return phase.tasks[taskIndex] ?? null;
}

export function getTotalProgress(): { totalTasks: number; totalPhases: number } {
  return {
    totalPhases: CURRICULUM.length,
    totalTasks: CURRICULUM.reduce((acc, p) => acc + p.tasks.length, 0),
  };
}
