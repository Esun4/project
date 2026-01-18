import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS configuration to allow your React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Allow your React dev server
    allow_credentials=True,
    allow_methods=["*"], # Allows POST, OPTIONS, GET, etc.
    allow_headers=["*"], # Allows Content-Type, Authorization, etc.
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Node(BaseModel):
    id: str
    text: str
    x: float
    y: float

class SuggestionRequest(BaseModel):
    active_node: Node  # Matches the 'active_node' key in your MindMap.jsx fetch
    other_nodes: List[Node] # Matches the 'other_nodes' key in your MindMap.jsx fetch

def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# RENAMED ROUTE to match your frontend fetch: /analyze-similarity
@app.post("/analyze-similarity")
async def analyze_similarity(data: SuggestionRequest):
    selected = data.active_node
    
    # 1. Filter: Remove truly empty nodes or placeholders
    others = [
        n for n in data.other_nodes 
        if n.text.strip().lower() not in ["", "empty node", "new node"]
    ]
    
    if not others:
        return [] # Return empty list if no valid neighbors exist

    # 2. Get Embeddings
    texts = [selected.text] + [n.text for n in others]
    try:
        response = client.embeddings.create(
            input=texts,
            model="text-embedding-3-small"
        )
        embeddings = [record.embedding for record in response.data]
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embeddings")

    selected_vec = embeddings[0]
    other_vecs = embeddings[1:]
    
    suggestions = []
    
    # 3. Calculate Similarity & Explanations
    for i, other_node in enumerate(others):
        score = cosine_similarity(selected_vec, other_vecs[i])
        
        # Threshold: Only suggest if they are somewhat related
        if score > 0.35: 
            prompt = (
                f"In a mind map, one concept is '{selected.text}' and another is '{other_node.text}'. "
                f"Write a 1-sentence intuitive connection between them."
            )
            
            try:
                ai_explanation = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=40
                ).choices[0].message.content.replace('"', '') # Strip quotes
            except:
                ai_explanation = "These concepts appear to be semantically related."

            suggestions.append({
                "targetNodeId": other_node.id,
                "score": float(score),
                "explanation": ai_explanation
            })

    # Sort by strongest match first
    suggestions.sort(key=lambda x: x["score"], reverse=True)
    
    # Return the list directly so frontend gets [{}, {}, {}]
    return suggestions[:5]