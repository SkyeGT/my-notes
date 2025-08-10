# Professional Notes - Knowledge Graph

A beautiful, interactive web interface for your Obsidian notes with dynamic graph visualization and dark mode support.

## Features

- 🌐 **Interactive Knowledge Graph**: Visualize connections between your notes with D3.js
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔍 **Dual View Modes**: Switch between graph view and traditional folder tree
- 🔗 **Obsidian Link Support**: Handles `[[internal links]]` and tags
- ⚡ **Fast Navigation**: Click nodes or files to instantly view content
- 🎨 **Modern UI**: Clean, minimalist design with smooth animations

## Setup Instructions

### 1. Repository Setup

1. Create a new repository on GitHub (e.g., `your-username/your-notes`)
2. Clone this repository or copy all files to your new repository
3. Push the files to your GitHub repository:

```bash
git add .
git commit -m "Initial commit: Add notes website"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. The site will automatically deploy when you push changes

### 3. Access Your Site

Your site will be available at: `https://your-username.github.io/your-repository-name`

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles with dark mode support
├── script.js           # JavaScript for graph visualization and interactions
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions workflow for deployment
├── 1-Rough Notes/      # Your note folders
├── 2-Source Materials/
├── 3-Tags/
├── 4-Indexes/
├── 5-Template/
├── 6-Full Notes/
└── .gitignore         # Files to exclude from deployment
```

## How It Works

### Automatic Note Processing

The GitHub Actions workflow automatically:

1. **Scans** all markdown files in your note folders
2. **Extracts** metadata (status, tags, internal links)
3. **Generates** a `data.js` file with all note information
4. **Deploys** the site to GitHub Pages

### Graph Visualization

- **Nodes** represent your notes
- **Links** show connections between notes (via `[[internal links]]`)
- **Node size** reflects the number of connections
- **Colors** adapt to light/dark theme

### Supported Obsidian Features

- `[[Internal Links]]` - Creates connections in the graph
- `#tags` - Displayed as colored badges
- `Status: #Unfinished` - Shows status indicators
- Folder organization - Maintains your folder structure

## Customization

### Adding New Note Folders

Edit the `folders_to_process` list in `.github/workflows/deploy.yml`:

```python
folders_to_process = ['3-Tags', '5-Template', '6-Full Notes', 'Your-New-Folder']
```

### Styling

Modify `styles.css` to customize:
- Colors and themes
- Typography
- Layout and spacing
- Graph appearance

### Graph Behavior

Adjust graph settings in `script.js`:
- Force simulation parameters
- Node sizes and colors
- Link distances
- Zoom levels

## Excluding Files

Add files or patterns to `.gitignore` to exclude them from the website:

```
笔记管理思路.md
private-notes/
*.draft
```

## Troubleshooting

### Site Not Updating

1. Check the **Actions** tab in your GitHub repository
2. Look for failed workflow runs
3. Ensure your repository has Pages enabled
4. Verify the workflow has proper permissions

### Missing Notes

1. Check that your notes are in the processed folders
2. Ensure markdown files have `.md` extension
3. Verify files are not listed in `.gitignore`

### Graph Not Showing

1. Check browser console for JavaScript errors
2. Ensure `data.js` is being generated correctly
3. Verify D3.js library is loading

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used

- **D3.js** - Graph visualization
- **Marked.js** - Markdown parsing
- **CSS Grid/Flexbox** - Responsive layout
- **GitHub Actions** - Automated deployment
- **GitHub Pages** - Static site hosting

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).