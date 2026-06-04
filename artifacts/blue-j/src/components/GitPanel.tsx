import { useState, useCallback, useEffect } from 'react';
import { useBlueJStore } from '@/lib/store';
import {
  GitBranch, Folder, FileCode, Save, RefreshCw, Upload,
  Download, ChevronRight, ChevronDown, Loader2, AlertCircle,
  CheckCircle2, Terminal
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type GitEntry = { name: string; isDir: boolean; size: string | null };
type GitRepoRow = { id: number; url: string; name: string; localPath: string; branch: string; sessionId: string; createdAt: string };

export function GitPanel() {
  const { sessionId } = useBlueJStore();
  const [repos, setRepos] = useState<GitRepoRow[]>([]);
  const [activeRepoId, setActiveRepoId] = useState<number | null>(null);
  const [entries, setEntries] = useState<GitEntry[]>([]);
  const [currentPath, setCurrentPath] = useState('.');
  const [fileContent, setFileContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [statusText, setStatusText] = useState('');
  const [diffText, setDiffText] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const headers = useCallback(() => {
    const h: Record<string, string> = {};
    if (githubToken.trim()) h['x-github-token'] = githubToken.trim();
    return h;
  }, [githubToken]);

  const showMsg = (text: string) => { setMessage(text); setTimeout(() => setMessage(''), 4000); };

  const loadRepos = useCallback(async () => {
    try {
      const r = await fetch(`/api/bluej/git/list/${sessionId}`);
      const d = await r.json();
      setRepos(d.repos || []);
    } catch {
      setRepos([]);
    }
  }, [sessionId]);

  useEffect(() => { loadRepos(); }, [loadRepos]);

  const clone = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/bluej/git/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ url: repoUrl.trim(), sessionId }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setActiveRepoId(d.repo.id);
      await loadRepos();
      setCurrentPath('.');
      setEntries([]);
      setFileContent('');
      setFilePath('');
      showMsg(`Cloned ${d.repo.name}`);
    } catch (e: any) {
      showMsg(e.message || 'Clone failed');
    } finally { setLoading(false); }
  };

  const ls = async (repoId: number, path = '.') => {
    setLoading(true);
    try {
      const r = await fetch(`/api/bluej/git/${repoId}/ls?path=${encodeURIComponent(path)}`, { headers: headers() });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setEntries(d.entries || []);
      setCurrentPath(path);
      setFileContent('');
      setFilePath('');
    } catch (e: any) {
      showMsg(e.message || 'List failed');
    } finally { setLoading(false); }
  };

  const readFile = async (repoId: number, path: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/bluej/git/${repoId}/file?path=${encodeURIComponent(path)}`, { headers: headers() });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setFileContent(d.content);
      setFilePath(path);
    } catch (e: any) {
      showMsg(e.message || 'Read failed');
    } finally { setLoading(false); }
  };

  const writeFile = async () => {
    if (!activeRepoId || !filePath) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/bluej/git/${activeRepoId}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ path: filePath, content: fileContent }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      showMsg(`Saved ${filePath}`);
    } catch (e: any) {
      showMsg(e.message || 'Save failed');
    } finally { setLoading(false); }
  };

  const doStatus = async () => {
    if (!activeRepoId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/bluej/git/${activeRepoId}/status`, { headers: headers() });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setStatusText(d.status || 'Working tree clean');
      setDiffText('');
    } catch (e: any) {
      showMsg(e.message || 'Status failed');
    } finally { setLoading(false); }
  };

  const doDiff = async () => {
    if (!activeRepoId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/bluej/git/${activeRepoId}/diff`, { headers: headers() });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setDiffText(d.diff || '');
      setStatusText('');
    } catch (e: any) {
      showMsg(e.message || 'Diff failed');
    } finally { setLoading(false); }
  };

  const doCommit = async () => {
    if (!activeRepoId || !commitMessage.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/bluej/git/${activeRepoId}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ message: commitMessage.trim() }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      showMsg('Committed');
      setCommitMessage('');
    } catch (e: any) {
      showMsg(e.message || 'Commit failed');
    } finally { setLoading(false); }
  };

  const doPush = async () => {
    if (!activeRepoId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/bluej/git/${activeRepoId}/push`, {
        method: 'POST',
        headers: headers(),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      showMsg('Pushed');
    } catch (e: any) {
      showMsg(e.message || 'Push failed');
    } finally { setLoading(false); }
  };

  const activeRepo = repos.find(r => r.id === activeRepoId);

  const extToLang = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      py: 'python', js: 'javascript', ts: 'typescript', tsx: 'tsx', jsx: 'jsx',
      cpp: 'cpp', c: 'c', h: 'cpp', hpp: 'cpp', rs: 'rust', go: 'go',
      java: 'java', json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown',
      html: 'html', css: 'css', sql: 'sql', sh: 'bash', bash: 'bash',
    };
    return map[ext] || 'text';
  };

  return (
    <div className="h-full flex flex-col hud-panel overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-primary/20 bg-secondary/50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-primary font-hud uppercase tracking-widest text-sm">
          <GitBranch className="w-4 h-4" />
          <span>Version Control // Git</span>
        </div>
        {activeRepo && (
          <div className="text-[0.65rem] font-mono text-primary/50">
            {activeRepo.name} → {activeRepo.branch}
          </div>
        )}
      </div>

      {/* Token + Repo selector */}
      <div className="p-3 border-b border-primary/10 space-y-2 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <input
            type="password"
            placeholder="GitHub PAT (ghp_...)"
            value={githubToken}
            onChange={e => setGithubToken(e.target.value)}
            className="flex-1 bg-background border border-primary/30 rounded-sm px-2 py-1 text-xs font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="https://github.com/owner/repo.git"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            className="flex-[2] bg-background border border-primary/30 rounded-sm px-2 py-1 text-xs font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary"
          />
          <button
            onClick={clone}
            disabled={loading || !repoUrl.trim()}
            className="px-3 py-1.5 bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent rounded-sm text-xs font-hud uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Clone
          </button>
        </div>

        {repos.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {repos.map(r => (
              <button
                key={r.id}
                onClick={() => { setActiveRepoId(r.id); ls(r.id, '.'); }}
                className={`px-2 py-1 text-[0.65rem] font-mono rounded-sm border transition-all ${
                  activeRepoId === r.id
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-secondary border-primary/20 text-primary/50 hover:text-primary/80'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}

        {message && (
          <div className="flex items-center gap-1.5 text-[0.7rem] text-accent font-mono">
            <AlertCircle className="w-3 h-3" />
            {message}
          </div>
        )}
      </div>

      {/* Main area: file tree + editor */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* File tree */}
        <div className="w-48 flex-shrink-0 border-r border-primary/10 overflow-y-auto p-2 space-y-0.5">
          {currentPath !== '.' && (
            <button
              onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                const parent = parts.join('/') || '.';
                if (activeRepoId) ls(activeRepoId, parent);
              }}
              className="flex items-center gap-1.5 w-full text-left px-1.5 py-1 text-[0.7rem] font-mono text-primary/60 hover:bg-primary/5 rounded-sm transition-colors"
            >
              <ChevronDown className="w-3 h-3 rotate-90" /> ..
            </button>
          )}
          {entries.map(e => (
            <button
              key={e.name}
              onClick={() => {
                if (!activeRepoId) return;
                const target = currentPath === '.' ? e.name : `${currentPath}/${e.name}`;
                if (e.isDir) ls(activeRepoId, target);
                else readFile(activeRepoId, target);
              }}
              className={`flex items-center gap-1.5 w-full text-left px-1.5 py-1 text-[0.7rem] font-mono rounded-sm transition-colors ${
                filePath === (currentPath === '.' ? e.name : `${currentPath}/${e.name}`)
                  ? 'bg-primary/10 text-primary'
                  : 'text-primary/60 hover:bg-primary/5'
              }`}
            >
              {e.isDir ? <Folder className="w-3 h-3 text-accent/70" /> : <FileCode className="w-3 h-3 text-primary/50" />}
              <span className="truncate">{e.name}</span>
            </button>
          ))}
          {entries.length === 0 && !loading && (
            <div className="text-[0.65rem] font-mono text-primary/30 p-2">
              {activeRepo ? 'Empty directory' : 'No repo selected'}
            </div>
          )}
        </div>

        {/* Editor or status/diff */}
        <div className="flex-1 flex flex-col min-h-0">
          {filePath ? (
            <>
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-primary/10 bg-secondary/30 flex-shrink-0">
                <div className="text-[0.7rem] font-mono text-primary/70 truncate">{filePath}</div>
                <div className="flex gap-2">
                  <button
                    onClick={writeFile}
                    disabled={loading}
                    className="flex items-center gap-1 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-sm text-[0.65rem] font-hud uppercase tracking-wider transition-all"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
              <textarea
                value={fileContent}
                onChange={e => setFileContent(e.target.value)}
                className="flex-1 bg-background font-mono text-xs text-primary p-3 resize-none focus:outline-none overflow-auto whitespace-pre"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </>
          ) : diffText ? (
            <div className="flex-1 overflow-auto p-3 font-mono text-xs whitespace-pre text-primary">
              <div className="flex items-center gap-2 mb-2 text-[0.65rem] text-accent uppercase font-hud tracking-wider">
                <Terminal className="w-3 h-3" /> Diff
              </div>
              {diffText || <span className="text-primary/30 italic">No changes</span>}
            </div>
          ) : statusText ? (
            <div className="flex-1 overflow-auto p-3 font-mono text-xs whitespace-pre text-primary">
              <div className="flex items-center gap-2 mb-2 text-[0.65rem] text-accent uppercase font-hud tracking-wider">
                <Terminal className="w-3 h-3" /> Status
              </div>
              {statusText}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-primary/30 text-sm font-mono">
              {activeRepo ? 'Select a file from the tree' : 'Clone a repository to begin'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom toolbar */}
      {activeRepoId && (
        <div className="p-2 border-t border-primary/10 bg-secondary/30 flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            onClick={doStatus}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-sm text-[0.65rem] font-hud uppercase tracking-wider transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Status
          </button>
          <button
            onClick={doDiff}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-sm text-[0.65rem] font-hud uppercase tracking-wider transition-all"
          >
            <ChevronRight className="w-3 h-3" /> Diff
          </button>
          <div className="flex-1 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Commit message"
              value={commitMessage}
              onChange={e => setCommitMessage(e.target.value)}
              className="flex-1 bg-background border border-primary/30 rounded-sm px-2 py-1 text-xs font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary"
            />
            <button
              onClick={doCommit}
              disabled={loading || !commitMessage.trim()}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-sm text-[0.65rem] font-hud uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3 h-3" /> Commit
            </button>
            <button
              onClick={doPush}
              disabled={loading || !githubToken.trim()}
              className="flex items-center gap-1 px-2 py-1 bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent rounded-sm text-[0.65rem] font-hud uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <Upload className="w-3 h-3" /> Push
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
