class NotesApp {
    constructor() {
        this.notes = new Map();
        this.links = [];
        this.currentView = 'graph';
        this.selectedNote = null;
        this.simulation = null;
        this.svg = null;
        this.zoom = null;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.setupTheme();
        await this.loadNotes();
        this.setupGraph();
        this.renderFolderTree();
    }
    
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // View toggles
        document.getElementById('graph-toggle').addEventListener('click', () => {
            this.switchView('graph');
        });
        
        document.getElementById('list-toggle').addEventListener('click', () => {
            this.switchView('list');
        });
        
        // Graph controls
        document.getElementById('zoom-slider').addEventListener('input', (e) => {
            this.setZoom(parseFloat(e.target.value));
        });
        
        document.getElementById('reset-zoom').addEventListener('click', () => {
            this.resetZoom();
        });
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Update buttons
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update containers
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });
        
        document.getElementById(`${view}-container`).classList.add('active');
    }
    
    async loadNotes() {
        // Load notes from dynamically generated data.js if available
        if (window.NOTES_DATA) {
            Object.entries(window.NOTES_DATA).forEach(([filename, note]) => {
                this.notes.set(filename, note);
            });
            this.buildLinks();
            return;
        }
        
        // Fallback: Define the note structure based on the folder structure
        const noteStructure = {
            '3-Tags': ['LLM.md', '未命名.md'],
            '5-Template': ['Materials.md', 'New note.md'],
            '6-Full Notes': ['Deep Dive into LLMs like ChatGPT.md', 'Smolagents源码学习.md']
        };
        
        // Sample note data (fallback for local development)
        const sampleNotes = {
            'LLM.md': {
                title: 'LLM',
                content: '# LLM\n\nLarge Language Models tag page.',
                tags: [],
                status: '',
                folder: '3-Tags',
                links: []
            },
            '未命名.md': {
                title: '未命名',
                content: '# 未命名\n\nUntitled note.',
                tags: [],
                status: '',
                folder: '3-Tags',
                links: []
            },
            'Materials.md': {
                title: 'Materials Template',
                content: '# Source\n\n\n\n\n# Notes\n\n',
                tags: [],
                status: '',
                folder: '5-Template',
                links: []
            },
            'New note.md': {
                title: 'New Note Template',
                content: '{{date}}      {{time}}\n\nStatus:\n\nTags:\n\n# {{Title}}\n\n\n\n\n# References\n\n\n\n\n\n',
                tags: [],
                status: '',
                folder: '5-Template',
                links: []
            },
            'Deep Dive into LLMs like ChatGPT.md': {
                title: 'Deep Dive into LLMs like ChatGPT',
                content: `2025-08-09      11:06

Status: #Unfinished

Tags: [[LLM]]


# Deep Dive into LLMs like ChatGPT

主要观点：
1.大模型的记忆非常重要，当在大模型的会话框内给出参考的上下文，可以显著提升模型表现
2.大模型的数学能力一般较弱，与其让其做算术（相当于人类心算），不如让其生成代码
3.大模型和人类思考存在显著差异，分词化的操作也有问题，例如识别一个单词里有几个字母这类简单任务也会出错


# References





`,
                tags: ['LLM'],
                status: 'Unfinished',
                folder: '6-Full Notes',
                links: ['LLM.md']
            },
            'Smolagents源码学习.md': {
                title: 'Smolagents源码学习',
                content: '# Smolagents源码学习\n\nSource code analysis of Smolagents.',
                tags: [],
                status: '',
                folder: '6-Full Notes',
                links: []
            }
        };
        
        // Load notes into the map
        Object.entries(sampleNotes).forEach(([filename, note]) => {
            this.notes.set(filename, note);
        });
        
        // Build links array for graph
        this.buildLinks();
    }
    
    buildLinks() {
        this.links = [];
        
        this.notes.forEach((note, filename) => {
            note.links.forEach(linkedFile => {
                if (this.notes.has(linkedFile)) {
                    this.links.push({
                        source: filename,
                        target: linkedFile
                    });
                }
            });
        });
    }
    
    setupGraph() {
        const container = document.getElementById('graph-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.svg = d3.select('#graph')
            .attr('width', width)
            .attr('height', height);
        
        // Setup zoom
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', (event) => {
                this.svg.select('.graph-group').attr('transform', event.transform);
                document.getElementById('zoom-slider').value = event.transform.k;
            });
        
        this.svg.call(this.zoom);
        
        // Create main group for zooming
        const g = this.svg.append('g').attr('class', 'graph-group');
        
        this.renderGraph();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    renderGraph() {
        const nodes = Array.from(this.notes.keys()).map(filename => ({
            id: filename,
            title: this.notes.get(filename).title,
            folder: this.notes.get(filename).folder,
            status: this.notes.get(filename).status
        }));
        
        const links = this.links.map(link => ({ ...link }));
        
        // Clear existing graph
        this.svg.select('.graph-group').selectAll('*').remove();
        const g = this.svg.select('.graph-group');
        
        // Create simulation
        this.simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.svg.attr('width') / 2, this.svg.attr('height') / 2))
            .force('collision', d3.forceCollide().radius(30));
        
        // Create links
        const link = g.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'link');
        
        // Create nodes
        const node = g.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', d => this.getNodeRadius(d))
            .call(this.drag());
        
        // Create labels
        const label = g.append('g')
            .selectAll('text')
            .data(nodes)
            .enter().append('text')
            .attr('class', 'node-label')
            .text(d => this.truncateText(d.title, 15))
            .attr('dy', d => this.getNodeRadius(d) + 15);
        
        // Add event listeners
        node.on('click', (event, d) => {
            this.selectNote(d.id);
        })
        .on('mouseover', (event, d) => {
            this.showTooltip(event, d);
        })
        .on('mouseout', () => {
            this.hideTooltip();
        });
        
        // Update positions on simulation tick
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
            
            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
    }
    
    getNodeRadius(node) {
        const baseRadius = 8;
        const linkCount = this.links.filter(link => 
            link.source === node.id || link.target === node.id
        ).length;
        return baseRadius + Math.min(linkCount * 2, 12);
    }
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    drag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }
    
    showTooltip(event, node) {
        const tooltip = document.getElementById('tooltip');
        const note = this.notes.get(node.id);
        
        tooltip.innerHTML = `
            <strong>${node.title}</strong><br>
            Folder: ${node.folder}<br>
            ${node.status ? `Status: ${node.status}<br>` : ''}
            Links: ${note.links.length}
        `;
        
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY - 10) + 'px';
        tooltip.classList.add('visible');
    }
    
    hideTooltip() {
        document.getElementById('tooltip').classList.remove('visible');
    }
    
    setZoom(scale) {
        this.svg.transition().duration(300).call(
            this.zoom.transform,
            d3.zoomIdentity.scale(scale)
        );
    }
    
    resetZoom() {
        this.svg.transition().duration(500).call(
            this.zoom.transform,
            d3.zoomIdentity
        );
        document.getElementById('zoom-slider').value = 1;
    }
    
    handleResize() {
        const container = document.getElementById('graph-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.svg.attr('width', width).attr('height', height);
        
        if (this.simulation) {
            this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
            this.simulation.alpha(0.3).restart();
        }
    }
    
    renderFolderTree() {
        const folderTree = document.getElementById('folder-tree');
        const folders = {};
        
        // Group notes by folder
        this.notes.forEach((note, filename) => {
            if (!folders[note.folder]) {
                folders[note.folder] = [];
            }
            folders[note.folder].push({ filename, note });
        });
        
        // Render folder structure
        let html = '';
        Object.entries(folders).forEach(([folderName, files]) => {
            html += `
                <div class="folder">
                    <div class="folder-title">${folderName}</div>
                    ${files.map(({ filename, note }) => `
                        <div class="file-item" data-file="${filename}">
                            ${note.title}
                        </div>
                    `).join('')}
                </div>
            `;
        });
        
        folderTree.innerHTML = html;
        
        // Add click listeners
        folderTree.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const filename = item.dataset.file;
                this.selectNote(filename);
            });
        });
    }
    
    selectNote(filename) {
        this.selectedNote = filename;
        const note = this.notes.get(filename);
        
        if (!note) return;
        
        // Update graph selection
        this.svg.selectAll('.node')
            .classed('selected', d => d.id === filename);
        
        // Update list selection
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.file === filename);
        });
        
        // Render note content
        this.renderNoteContent(note);
    }
    
    renderNoteContent(note) {
        const contentPanel = document.getElementById('note-content');
        
        // Configure marked options for better line break handling
        marked.setOptions({
            breaks: true,  // Enable line breaks
            gfm: true,     // Enable GitHub Flavored Markdown
            sanitize: false
        });
        
        // Parse markdown content
        let html = marked.parse(note.content);
        
        // Process Obsidian-style links [[link]]
        html = html.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
            const linkedFile = linkText + '.md';
            if (this.notes.has(linkedFile)) {
                return `<a href="#" class="internal-link" data-file="${linkedFile}">${linkText}</a>`;
            }
            return `<span class="broken-link">${linkText}</span>`;
        });
        
        // Process tags
        html = html.replace(/#(\w+)/g, '<span class="tag">#$1</span>');
        
        // Process status
        if (note.status) {
            const statusClass = note.status.toLowerCase().replace('#', '');
            html = `<div class="status ${statusClass}">${note.status}</div>` + html;
        }
        
        contentPanel.innerHTML = html;
        
        // Add click listeners to internal links
        contentPanel.querySelectorAll('.internal-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filename = link.dataset.file;
                this.selectNote(filename);
            });
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});