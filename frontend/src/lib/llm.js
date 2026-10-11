/**
 * GapFill - Universal LLM Abstraction Layer
 * Supports: Anthropic Claude, OpenAI, Google Gemini, Ollama, and Built-in Demo Simulator
 */

export function getLLMConfig() {
  try {
    const saved = localStorage.getItem("llm_config");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading llm_config", e);
  }
  return {
    provider: "demo", // default to demo mode so app works out of the box!
    apiKey: "",
    model: "claude-3-5-sonnet-20241022",
    ollamaEndpoint: "http://localhost:11434"
  };
}

export function saveLLMConfig(config) {
  localStorage.setItem("llm_config", JSON.stringify(config));
}

export async function callLLM(systemPrompt, userMessage, history = []) {
  const config = getLLMConfig();

  // 1. ANTHROPIC CLAUDE
  if (config.provider === "anthropic") {
    if (!config.apiKey) throw new Error("Anthropic API key is required. Please set it in Settings.");
    const messages = [
      ...history.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
      { role: "user", content: userMessage }
    ];

    const modelName = config.model || "claude-3-5-sonnet-20241022";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 2500,
        system: systemPrompt,
        messages
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Anthropic API Error (${res.status}): ${err.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }

  // 2. OPENAI GPT
  if (config.provider === "openai") {
    if (!config.apiKey) throw new Error("OpenAI API key is required. Please set it in Settings.");
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage }
    ];

    const modelName = config.model || "gpt-4o";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API Error (${res.status}): ${err.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // 3. GOOGLE GEMINI
  if (config.provider === "gemini") {
    if (!config.apiKey) throw new Error("Google Gemini API key is required. Please set it in Settings.");
    const modelName = config.model || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`;

    const contents = [];
    if (systemPrompt) {
      contents.push({ role: "user", parts: [{ text: `[System Instructions]: ${systemPrompt}` }] });
      contents.push({ role: "model", parts: [{ text: "Understood. I will strictly adhere to these instructions." }] });
    }
    for (const h of history) {
      contents.push({
        role: h.role === "assistant" || h.role === "model" ? "model" : "user",
        parts: [{ text: h.content }]
      });
    }
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 2500 }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini API Error (${res.status}): ${err.error?.message || res.statusText}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  // 4. LOCAL OLLAMA
  if (config.provider === "ollama") {
    const endpoint = (config.ollamaEndpoint || "http://localhost:11434").replace(/\/$/, "");
    const modelName = config.model || "llama3";
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage }
    ];

    const res = await fetch(`${endpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        stream: false,
        messages
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama Error (${res.status}): Is Ollama running on ${endpoint}?`);
    }
    const data = await res.json();
    return data.message?.content || "";
  }

  // 5. DEMO SIMULATOR (Ensures hackathon judges can test all features without API keys!)
  if (config.provider === "demo") {
    return simulateDemoResponse(systemPrompt, userMessage);
  }

  throw new Error(`Unknown LLM provider: ${config.provider}`);
}

/**
 * Intelligent fallback simulator for instant judge testing without API key setup
 */
function simulateDemoResponse(systemPrompt, userMessage) {
  // Simulate network latency (400ms)
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Syllabus parser response
      if (systemPrompt.includes("academic syllabus parser")) {
        resolve(JSON.stringify({
          topics: [
            {
              name: "Arrays & Dynamic Sizing",
              description: "Contiguous memory allocation, time complexity of access and resizing.",
              difficulty: "Easy",
              estimatedHours: 1,
              prerequisites: []
            },
            {
              name: "Singly & Doubly Linked Lists",
              description: "Node structures, pointer manipulations, insertion, and reversal algorithms.",
              difficulty: "Medium",
              estimatedHours: 2,
              prerequisites: ["Arrays & Dynamic Sizing"]
            },
            {
              name: "Stacks & Queue Applications",
              description: "LIFO/FIFO mechanisms, infix-to-postfix conversion, circular queues.",
              difficulty: "Medium",
              estimatedHours: 2,
              prerequisites: ["Arrays & Dynamic Sizing", "Singly & Doubly Linked Lists"]
            },
            {
              name: "Binary Trees & BST Traversals",
              description: "Inorder, preorder, postorder traversals, BST property, and validation.",
              difficulty: "Medium",
              estimatedHours: 2,
              prerequisites: ["Singly & Doubly Linked Lists"]
            },
            {
              name: "AVL & Self-Balancing Trees",
              description: "Balance factors, single and double rotations (LL, RR, LR, RL).",
              difficulty: "Hard",
              estimatedHours: 3,
              prerequisites: ["Binary Trees & BST Traversals"]
            },
            {
              name: "Graph Traversals (BFS & DFS)",
              description: "Adjacency matrix vs list, queue/stack traversals, cycle detection.",
              difficulty: "Hard",
              estimatedHours: 3,
              prerequisites: ["Stacks & Queue Applications", "Binary Trees & BST Traversals"]
            },
            {
              name: "Hash Tables & Collision Handling",
              description: "Hash functions, chaining, open addressing (linear probing, quadratic).",
              difficulty: "Medium",
              estimatedHours: 2,
              prerequisites: ["Arrays & Dynamic Sizing"]
            }
          ]
        }, null, 2));
        return;
      }

      // 2. PYQ Mapper response
      if (systemPrompt.includes("Map each question to the most relevant topic")) {
        resolve(JSON.stringify({
          mappings: [
            { question: "Explain the difference between singly and doubly linked lists with insertion cost. (5 marks)", topic: "Singly & Doubly Linked Lists", marks: 5 },
            { question: "Perform AVL tree rotations for sequence: 10, 20, 30, 25, 28. (10 marks)", topic: "AVL & Self-Balancing Trees", marks: 10 },
            { question: "Write algorithm for BFS and state its time complexity using adjacency list. (10 marks)", topic: "Graph Traversals (BFS & DFS)", marks: 10 },
            { question: "How does collision resolution work in separate chaining vs linear probing? (5 marks)", topic: "Hash Tables & Collision Handling", marks: 5 },
            { question: "Implement a circular queue using an array. Handle overflow & underflow. (5 marks)", topic: "Stacks & Queue Applications", marks: 5 }
          ]
        }, null, 2));
        return;
      }

      // 3. Question Generator response
      if (systemPrompt.includes("Generate exam-style questions") || systemPrompt.includes("Generate {n} exam-style questions")) {
        resolve(JSON.stringify({
          questions: [
            {
              id: "demo-q1",
              question: "When reversing a singly linked list in-place with three pointers (prev, curr, next), what causes a cyclic reference if not terminated properly?",
              type: "short_answer",
              marks: 5,
              correctAnswer: "Failing to set the original head's next pointer to null/nullptr creates an infinite loop back to the preceding node.",
              conceptTested: "In-place pointer reversal and head-to-null termination"
            },
            {
              id: "demo-q2",
              question: "What is the primary trade-off of a Doubly Linked List compared to a Singly Linked List?",
              type: "mcq",
              options: [
                "A) O(1) random access by index",
                "B) Bidirectional traversal at the cost of 2x pointer memory overhead",
                "C) Reduced cache locality with identical memory footprint",
                "D) Faster worst-case search time of O(log N)"
              ],
              correctAnswer: "B) Bidirectional traversal at the cost of 2x pointer memory overhead",
              marks: 5,
              conceptTested: "Doubly linked list spatial trade-offs"
            },
            {
              id: "demo-q3",
              question: "In an AVL tree, which rotation sequence is required when inserting into the left subtree of the right child?",
              type: "mcq",
              options: [
                "A) Single Right Rotation (LL)",
                "B) Single Left Rotation (RR)",
                "C) Right-Left Double Rotation (RL)",
                "D) Left-Right Double Rotation (LR)"
              ],
              correctAnswer: "C) Right-Left Double Rotation (RL)",
              marks: 5,
              conceptTested: "AVL tree imbalance diagnosis and rotation type"
            }
          ]
        }, null, 2));
        return;
      }

      // 4. Quiz Evaluator response
      if (systemPrompt.includes("evaluating a student's answer")) {
        const isLikelyWrong = userMessage.toLowerCase().includes("don't know") ||
          userMessage.toLowerCase().includes("not sure") ||
          userMessage.length < 15;

        if (isLikelyWrong) {
          resolve(JSON.stringify({
            correct: false,
            score: 3,
            conceptualError: "Confused traversal direction with pointer updates, missing the termination step that prevents cyclic references.",
            errorCategory: "Mental Model Misconception",
            explanation: "In an in-place reversal, the initial head must explicitly have its next pointer assigned to NULL. Otherwise, it continues pointing to what is now the second node, creating an infinite cycle.",
            hint: "Think about what `head.next` should point to once it becomes the new tail of the list.",
            relatedTopics: ["Singly & Doubly Linked Lists", "Memory Management & Pointers"]
          }, null, 2));
        } else {
          resolve(JSON.stringify({
            correct: true,
            score: 9,
            conceptualError: null,
            errorCategory: "None",
            explanation: "Excellent reasoning. You correctly identified the pointer realignment sequence and the termination boundary condition.",
            hint: null,
            relatedTopics: ["Singly & Doubly Linked Lists"]
          }, null, 2));
        }
        return;
      }

      // 5. Resource Recommender response
      if (systemPrompt.includes("A student is stuck on a specific concept")) {
        resolve(JSON.stringify({
          resourceType: "video",
          title: "NeetCode — Reverse Linked List (Visual Pointer Animation)",
          why: "Directly illustrates pointer state changes step-by-step so you don't confuse node traversal with link inversion.",
          searchQuery: "Neetcode reverse linked list visual explanation",
          recommendedTimestampOrSection: "Timestamp 02:45 (pointer diagram)"
        }, null, 2));
        return;
      }

      // 6. Default Chatbot response
      resolve(
        `Based on your active study profile:\n\n` +
        `• **Immediate Action Priority**: **AVL & Self-Balancing Trees** (Gap Score: 80%, Exam Frequency: 80%, Exam in 4 days).\n` +
        `• **Recent Mistake Pattern**: You previously struggled with *Right-Left (RL) rotations* and head termination in pointer reversal.\n\n` +
        `Would you like to do a quick 3-question diagnostic quiz on AVL rotations right now, or should I generate a 45-minute sprint study plan?`
      );
    }, 450);
  });
}
