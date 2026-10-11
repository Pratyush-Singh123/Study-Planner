import requests
import json
import re

def call_llm(system_prompt, user_message, provider="demo", api_key=None, model="claude-sonnet-4-6", history=None):
    history = history or []

    # 1. Anthropic Claude
    if provider == "anthropic":
        if not api_key:
            raise ValueError("Anthropic API key required")
        res = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            json={
                "model": model or "claude-3-5-sonnet-20241022",
                "max_tokens": 2000,
                "system": system_prompt,
                "messages": history + [{"role": "user", "content": user_message}]
            },
            timeout=30
        )
        res.raise_for_status()
        return res.json()["content"][0]["text"]

    # 2. OpenAI GPT
    elif provider == "openai":
        if not api_key:
            raise ValueError("OpenAI API key required")
        res = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model or "gpt-4o",
                "messages": [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": user_message}]
            },
            timeout=30
        )
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

    # 3. Google Gemini
    elif provider == "gemini":
        if not api_key:
            raise ValueError("Gemini API key required")
        model_name = model or "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"[System]: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood."}]})
        for h in history:
            role = "model" if h.get("role") in ["assistant", "model"] else "user"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": user_message}]})

        res = requests.post(url, headers={"Content-Type": "application/json"}, json={"contents": contents}, timeout=30)
        res.raise_for_status()
        return res.json()["candidates"][0]["content"]["parts"][0]["text"]

    # 4. Local Ollama
    elif provider == "ollama":
        endpoint = "http://localhost:11434/api/chat"
        res = requests.post(
            endpoint,
            json={
                "model": model or "llama3",
                "stream": False,
                "messages": [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": user_message}]
            },
            timeout=40
        )
        res.raise_for_status()
        return res.json()["message"]["content"]

    # 5. Demo / Mock Mode fallback
    elif provider == "demo" or not api_key:
        return simulate_backend_demo(system_prompt, user_message)

    raise ValueError(f"Unsupported provider: {provider}")


def safe_json(text):
    """
    Safely strip markdown code fences and parse JSON.
    Includes fallback regex extractor if text has preamble.
    """
    cleaned = text.strip()
    cleaned = re.sub(r'^```json\s*', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^```\s*', '', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'```$', '', cleaned, flags=re.MULTILINE).strip()

    try:
        return json.loads(cleaned)
    except Exception:
        # Try extracting innermost JSON block
        match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', cleaned)
        if match:
            return json.loads(match.group(0))
        raise


def simulate_backend_demo(system_prompt, user_message):
    """
    Deterministic simulated output for instant testing without API key setup.
    """
    if "syllabus parser" in system_prompt.lower():
        return json.dumps({
            "topics": [
                {"name": "Dynamic Arrays & Amortized Time", "description": "Contiguous array memory, resizing analysis, and vector operations.", "difficulty": "Easy", "estimatedHours": 1, "prerequisites": []},
                {"name": "Singly & Doubly Linked Lists", "description": "Pointer traversal, node manipulation, and in-place reversal.", "difficulty": "Medium", "estimatedHours": 2, "prerequisites": ["Dynamic Arrays & Amortized Time"]},
                {"name": "Stacks & Expression Parsing", "description": "LIFO mechanics, infix to postfix parsing, and recursion stack.", "difficulty": "Medium", "estimatedHours": 2, "prerequisites": ["Singly & Doubly Linked Lists"]},
                {"name": "AVL Trees & Balance Rotations", "description": "Binary search tree balance factor calculations and LL/RR/LR/RL rotations.", "difficulty": "Hard", "estimatedHours": 3, "prerequisites": ["Singly & Doubly Linked Lists"]},
                {"name": "Graph Traversals (BFS & DFS)", "description": "Adjacency matrix/list representations, queue BFS, and cycle detection.", "difficulty": "Hard", "estimatedHours": 3, "prerequisites": ["Stacks & Expression Parsing"]}
            ]
        })
    elif "map each exam question" in system_prompt.lower():
        return json.dumps({
            "mappings": [
                {"question": "Explain AVL tree rotations with an example of RL imbalance.", "topic": "AVL Trees & Balance Rotations", "marks": 10},
                {"question": "Write an algorithm to reverse a singly linked list in-place.", "topic": "Singly & Doubly Linked Lists", "marks": 5},
                {"question": "Demonstrate BFS traversal on a cyclic graph using a queue.", "topic": "Graph Traversals (BFS & DFS)", "marks": 8}
            ]
        })
    elif "generate exam-style questions" in system_prompt.lower():
        return json.dumps({
            "questions": [
                {"question": "Explain how double rotations restore the AVL height balance property.", "type": "theory", "marks": 5, "keyPoints": ["Balance factor ±2", "Subtree heights"]},
                {"question": "Trace insertion of [15, 20, 25, 10, 12] into an AVL tree.", "type": "implementation", "marks": 10, "keyPoints": ["LL rotation", "LR rotation"]}
            ]
        })
    elif "evaluating a student's exam answer" in system_prompt.lower():
        is_weak = len(user_message.strip()) < 20 or "not sure" in user_message.lower()
        if is_weak:
            return json.dumps({
                "correct": False,
                "score": 3,
                "conceptualError": "Failed to account for the reversal termination condition; confused pointer updates with traversal direction.",
                "explanation": "In an in-place list reversal, the original head becomes the new tail and must explicitly point to NULL, otherwise creating a cycle.",
                "hint": "Check what head.next points to after reversal.",
                "relatedTopics": ["Singly & Doubly Linked Lists", "Pointer Management"]
            })
        else:
            return json.dumps({
                "correct": True,
                "score": 9,
                "conceptualError": None,
                "explanation": "Clear explanation of pointer reassignment and termination conditions.",
                "hint": None,
                "relatedTopics": ["Singly & Doubly Linked Lists"]
            })
    elif "recommend one resource" in system_prompt.lower():
        return json.dumps({
            "resourceType": "video",
            "title": "NeetCode — Linked List In-Place Reversal Animated",
            "why": "Visualizes pointer steps so you do not confuse pointer reversal with traversal.",
            "searchQuery": "NeetCode reverse linked list visual animation"
        })
    else:
        return "Based on your syllabus, prioritize **AVL Trees & Balance Rotations** (Gap Score: 85%, Exam in 3 days). You previously struggled with LR/RL double rotations."
