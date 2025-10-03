class SalmanAI {
    constructor() {
        this.conversationHistory = this.loadConversationHistory();
        this.contextMemory = this.loadContextMemory();
        this.setupEventListeners();
        this.loadChatHistory();
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateIds() {
        return {
            requestId: `req_${this.generateUUID().replace(/-/g, '')}`,
            messageId: `msg_${this.generateUUID().replace(/-/g, '')}`,
            userId: `user_anon_${this.generateUUID().replace(/-/g, '')}`
        };
    }

    setupEventListeners() {
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        document.getElementById('clear-btn').addEventListener('click', () => this.clearChat());

        document.getElementById('message-input').addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });
    }

    loadConversationHistory() {
        const history = localStorage.getItem('salman_conversation_history');
        return history ? JSON.parse(history) : [];
    }

    saveConversationHistory() {
        localStorage.setItem('salman_conversation_history', JSON.stringify(this.conversationHistory));
    }

    loadContextMemory() {
        const memory = localStorage.getItem('salman_context_memory');
        return memory ? JSON.parse(memory) : [];
    }

    saveContextMemory() {
        localStorage.setItem('salman_context_memory', JSON.stringify(this.contextMemory));
    }

    loadChatHistory() {
        const container = document.getElementById('messages-container');
        container.innerHTML = `
            <div class="system-message">
                🤖 SALMAN'S AI Chat Mode Activated
                <br>You can now ask me anything! Just type your question and I'll respond with AI-powered answers.
            </div>
        `;

        this.conversationHistory.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                this.addMessageToUI(msg.role, msg.content);
            }
        });

        this.scrollToBottom();
    }

    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (!message) return;

        input.value = '';
        input.style.height = '';

        this.addMessageToUI('user', message);
        this.conversationHistory.push({ role: 'user', content: message });
        this.saveConversationHistory();

        this.analyzeAndStoreContext(message);

        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            
            if (!response || response.trim() === '') {
                throw new Error('Empty response from AI');
            }
            
            this.addMessageToUI('assistant', response);
            this.conversationHistory.push({ role: 'assistant', content: response });
            this.saveConversationHistory();
        } catch (error) {
            this.hideTypingIndicator();
            const errorMsg = error.message || 'Unknown error';
            this.addMessageToUI('assistant', `❌ Sorry, I encountered an error: ${errorMsg}. Please try again.`);
            console.error('AI Error:', error);
        }
    }

    analyzeAndStoreContext(message) {
        const messageLower = message.toLowerCase();

        if (messageLower.match(/make|create|build|tool|project|app/)) {
            if (messageLower.includes('python')) {
                this.storeContextMemory('current_project', `Python project: ${message.substring(0, 100)}`);
            } else if (messageLower.match(/website|web/)) {
                this.storeContextMemory('current_project', `Web project: ${message.substring(0, 100)}`);
            } else {
                this.storeContextMemory('current_project', `General project: ${message.substring(0, 100)}`);
            }
        }

        if (messageLower.match(/better|improve|enhance|add|modify|change/)) {
            this.storeContextMemory('last_request', `Improvement request: ${message.substring(0, 100)}`);
        }

        if (messageLower.match(/like|want|prefer/)) {
            this.storeContextMemory('user_preferences', message.substring(0, 150));
        }
    }

    storeContextMemory(type, data) {
        const existingIndex = this.contextMemory.findIndex(ctx => ctx.type === type);
        const contextData = { type, data, updated_at: new Date().toISOString() };

        if (existingIndex >= 0) {
            this.contextMemory[existingIndex] = contextData;
        } else {
            this.contextMemory.push(contextData);
        }

        if (this.contextMemory.length > 10) {
            this.contextMemory = this.contextMemory.slice(-10);
        }

        this.saveContextMemory();
    }

    prepareEnhancedPrompt() {
        const enhancedHistory = [];

        if (this.contextMemory.length > 0) {
            const contextSummary = this.contextMemory.slice(-3).map(ctx => {
                if (ctx.type === 'current_project') return `Current project context: ${ctx.data}`;
                if (ctx.type === 'last_request') return `Previous request: ${ctx.data}`;
                if (ctx.type === 'user_preferences') return `User preference: ${ctx.data}`;
                return '';
            }).filter(s => s).join(' | ');

            if (contextSummary) {
                enhancedHistory.push({
                    role: 'system',
                    content: `Context from previous conversations: ${contextSummary}`
                });
            }
        }

        const recentHistory = this.conversationHistory.slice(-10);
        enhancedHistory.push(...recentHistory);

        return enhancedHistory;
    }

    async getAIResponse(userMessage) {
        const ids = this.generateIds();
        const enhancedHistory = this.prepareEnhancedPrompt();

        const payload = {
            requestId: ids.requestId,
            conversationType: 'text',
            type: 'text',
            modelId: 'dolphin-3.0-mistral-24b',
            modelName: 'Venice Uncensored',
            modelType: 'text',
            prompt: enhancedHistory,
            systemPrompt: '',
            messageId: ids.messageId,
            includeVeniceSystemPrompt: true,
            isCharacter: false,
            userId: ids.userId,
            simpleMode: false,
            characterId: '',
            id: '',
            textToSpeech: {
                voiceId: 'af_sky',
                speed: 1,
            },
            webEnabled: true,
            reasoning: true,
            temperature: 0.3,
            topP: 1,
            clientProcessingTime: 11,
        };

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        let fullText = '';

        const lines = text.trim().split('\n');
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const data = JSON.parse(line.trim());
                    if (data.content) {
                        fullText += data.content;
                    }
                } catch (e) {
                }
            }
        }

        return fullText.trim() || '🤖 I received your message but couldn\'t generate a proper response. Please try rephrasing your question.';
    }

    addMessageToUI(role, content) {
        const container = document.getElementById('messages-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (role === 'assistant') {
            contentDiv.innerHTML = this.formatAIResponse(content);
            
            setTimeout(() => {
                const codeBlocks = contentDiv.querySelectorAll('pre');
                codeBlocks.forEach(block => {
                    this.addCopyButton(block);
                });
            }, 0);
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(contentDiv);
        container.appendChild(messageDiv);

        this.scrollToBottom();
    }

    addCopyButton(codeBlock) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        codeBlock.parentNode.insertBefore(wrapper, codeBlock);
        wrapper.appendChild(codeBlock);

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.onclick = () => {
            const code = codeBlock.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                copyBtn.innerHTML = '❌ Failed';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                }, 2000);
            });
        };

        wrapper.appendChild(copyBtn);
    }

    formatAIResponse(text) {
        let formatted = text;

        formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
        });

        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        const container = document.getElementById('messages-container');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        container.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.conversationHistory = [];
            this.contextMemory = [];
            this.saveConversationHistory();
            this.saveContextMemory();
            
            const container = document.getElementById('messages-container');
            container.innerHTML = `
                <div class="system-message">
                    🗑️ Chat history cleared!
                    <br>Start a new conversation by typing below.
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SalmanAI();
});
