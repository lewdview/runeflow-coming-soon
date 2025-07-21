'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CubeIcon, 
  UsersIcon, 
  ServerIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BoltIcon,
  GlobeAltIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  CloudArrowDownIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  CodeBracketIcon,
  FolderIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface Stats {
  total_templates: number;
  total_categories: number;
  total_integrations: number;
  difficulty_distribution: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
  top_categories: Record<string, number>;
}

interface Template {
  id: string;
  name: string;
  category_name: string;
  category_id: string;
  difficulty: string;
  download_count: number;
  rating: string;
  description: string;
  file_size: string;
  estimated_setup_time: string;
  category_icon: string;
  integrations?: string[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  template_count: string;
  icon: string;
  color: string;
  description: string;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  template_count: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const COLORS = ['#ff6b35', '#d4af37', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'download_count', label: 'Most Downloaded' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'created_at', label: 'Newest' },
];
const PAGE_SIZES = [10, 20, 50, 100];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [activeView, setActiveView] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [glassWindowOpen, setGlassWindowOpen] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  
  // Search and filtering states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })
const [searchResults, setSearchResults] = useState<Template[]>([])
const [activeDetailTab, setActiveDetailTab] = useState('info')
const [isSearching, setIsSearching] = useState(false)
const [templateFiles, setTemplateFiles] = useState<any>(null)
const [filesLoading, setFilesLoading] = useState(false)

  useEffect(() => {
    fetchData()
    // Set up real-time updates
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Load templates with pagination when filters change
  useEffect(() => {
    if (!loading) {
      fetchTemplates(1, 20) // Load first page with 20 templates
    }
  }, [selectedCategory, selectedDifficulty, sortBy])

  const fetchData = async () => {
    try {
      const [statsRes, templatesRes, categoriesRes] = await Promise.all([
        fetch('/api/v1/stats'),
        fetch('/api/v1/templates?limit=10'),
        fetch('/api/v1/categories')
      ])

      const statsData = await statsRes.json()
      const templatesData = await templatesRes.json()
      const categoriesData = await categoriesRes.json()

      setStats(statsData)
      setTemplates(templatesData.templates || [])
      setCategories(categoriesData)
      if (templatesData.pagination) {
        setPagination(templatesData.pagination)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchTemplates = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '50'
      })
      
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory)
      }
      
      if (selectedDifficulty !== 'All') {
        params.append('difficulty', selectedDifficulty)
      }

      const response = await fetch(`/api/v1/search?${params}`)
      const data = await response.json()
      
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const fetchTemplates = async (page = 1, limit = 20) => {
    setTemplatesLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy
      })
      
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory)
      }
      
      if (selectedDifficulty !== 'All') {
        params.append('difficulty', selectedDifficulty)
      }

      const response = await fetch(`/api/v1/templates?${params}`)
      const data = await response.json()
      
      setTemplates(data.templates || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      searchTemplates(query)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const handleFilterChange = () => {
    if (searchQuery) {
      searchTemplates(searchQuery)
    } else {
      fetchTemplates(1, pagination.limit)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchTemplates(newPage, pagination.limit)
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
    fetchTemplates(1, newLimit)
  }

  const exportTemplates = async (format: 'json' | 'csv' | 'xlsx') => {
    setExportLoading(true)
    try {
      const response = await fetch(`/api/v1/export?format=${format}&category=${selectedCategory}&difficulty=${selectedDifficulty}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `runeflow_templates.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExportLoading(false)
    }
  }

  const copyTemplateData = (template: Template) => {
    const data = JSON.stringify(template, null, 2)
    navigator.clipboard.writeText(data)
      .then(() => alert('Template data copied to clipboard!'))
      .catch(() => alert('Failed to copy template data'))
  }

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template)
    fetchTemplateFiles(template.id)
  }

  const fetchTemplateFiles = async (templateId: string) => {
    setFilesLoading(true)
    try {
      const response = await fetch(`/api/v1/templates/${templateId}/files`)
      const data = await response.json()
      setTemplateFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching template files:', error)
      setTemplateFiles([])
    } finally {
      setFilesLoading(false)
    }
  }
  
  const simulateProcessing = () => {
    setProcessingStatus('processing')
    setTimeout(() => {
      setProcessingStatus(Math.random() > 0.2 ? 'success' : 'error')
      setTimeout(() => setProcessingStatus('idle'), 3000)
    }, 2000)
  }

  const difficultyData = stats ? [
    { name: 'Beginner', value: stats.difficulty_distribution.Beginner },
    { name: 'Intermediate', value: stats.difficulty_distribution.Intermediate },
    { name: 'Advanced', value: stats.difficulty_distribution.Advanced }
  ] : []

  const categoryData = stats ? Object.entries(stats.top_categories).map(([name, count]) => ({
    name,
    count
  })) : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading RuneFlow Dashboard...</p>
        </div>
      </div>
    )
  }

  // Template Grid Component
  const TemplateGrid = ({ templates, viewMode, onTemplateClick, onTemplateCopy }: {
    templates: Template[];
    viewMode: 'grid' | 'list';
    onTemplateClick: (template: Template) => void;
    onTemplateCopy: (template: Template) => void;
  }) => {
    if (viewMode === 'list') {
      return (
        <div className="space-y-2">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-lg p-4 hover:bg-white/5 transition-all cursor-pointer"
              onClick={() => onTemplateClick(template)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-white truncate max-w-md">
                      {template.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 truncate max-w-2xl">
                    {template.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{template.category_name}</span>
                    <span>•</span>
                    <span>{template.download_count} downloads</span>
                    <span>•</span>
                    <span>⭐ {parseFloat(template.rating).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onTemplateCopy(template)}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Copy template data"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => window.open(`/api/v1/templates/${template.id}/download`, '_blank')}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Download template"
                  >
                    <CloudArrowDownIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    // Grid view
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-xl p-6 hover:bg-white/5 transition-all cursor-pointer group"
            onClick={() => onTemplateClick(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2 line-clamp-2">
                  {template.name}
                </h3>
                <span className={`inline-block px-2 py-1 rounded text-xs mb-2 ${
                  template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                  template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {template.difficulty}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-3">
              {template.description}
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-300">{template.category_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Downloads</span>
                <span className="text-gray-300">{template.download_count}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Rating</span>
                <span className="text-gray-300">⭐ {parseFloat(template.rating).toFixed(1)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onTemplateCopy(template)}
                className="flex-1 px-3 py-2 bg-runeflow-500/20 hover:bg-runeflow-500/30 text-runeflow-400 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={() => window.open(`/api/v1/templates/${template.id}/download`, '_blank')}
                className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
              >
                <CloudArrowDownIcon className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold runic-text mb-2">
                🔮 RuneFlow Template Collection
              </h1>
              <p className="text-gray-400 text-lg">
                Ancient Power. Modern Automation. Real Progress.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* Export Options */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportTemplates('json')}
                  disabled={exportLoading}
                  className="btn-runic flex items-center space-x-1 text-sm px-3 py-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => exportTemplates('csv')}
                  disabled={exportLoading}
                  className="btn-runic flex items-center space-x-1 text-sm px-3 py-2"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>CSV</span>
                </button>
              </div>
              
              {/* Glass Window Toggle */}
              <button
                onClick={() => setGlassWindowOpen(!glassWindowOpen)}
                className={`btn-runic flex items-center space-x-2 ${glassWindowOpen ? 'runic-glow' : ''}`}
              >
                <EyeIcon className="w-5 h-5" />
                <span>Glass Window</span>
              </button>
              
              {/* Processing Simulator */}
              <button
                onClick={simulateProcessing}
                disabled={processingStatus === 'processing'}
                className="btn-runic flex items-center space-x-2"
              >
                <BoltIcon className={`w-5 h-5 ${processingStatus === 'processing' ? 'animate-spin' : ''}`} />
                <span>Simulate Process</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Glass Window Overlay */}
      {glassWindowOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setGlassWindowOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="glass-strong rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold runic-text">🪟 Glass Window - Live Processing</h2>
              <button
                onClick={() => setGlassWindowOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Database Connection</span>
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-gray-400">PostgreSQL connection active, 4074 templates loaded</p>
              </div>
              
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">API Server Status</span>
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-gray-400">Express.js server running on port 3001</p>
              </div>
              
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Template Processing</span>
                  {processingStatus === 'idle' && <ClockIcon className="w-6 h-6 text-gray-500" />}
                  {processingStatus === 'processing' && <div className="spinner"></div>}
                  {processingStatus === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                  {processingStatus === 'error' && <XCircleIcon className="w-6 h-6 text-red-500" />}
                </div>
                <p className="text-sm text-gray-400">
                  {processingStatus === 'idle' && 'Ready for processing'}
                  {processingStatus === 'processing' && 'Processing automation workflow...'}
                  {processingStatus === 'success' && 'Process completed successfully'}
                  {processingStatus === 'error' && 'Process failed - check logs'}
                </p>
              </div>
              
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Real-time Analytics</span>
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-runeflow-500">{stats?.total_templates || 0}</div>
                    <div className="text-xs text-gray-400">Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-runic-gold-500">{stats?.total_categories || 0}</div>
                    <div className="text-xs text-gray-400">Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Templates</p>
              <p className="text-3xl font-bold text-runeflow-500">{stats?.total_templates || 0}</p>
            </div>
            <CubeIcon className="w-12 h-12 text-runeflow-500/30" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-3xl font-bold text-runic-gold-500">{stats?.total_categories || 0}</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-runic-gold-500/30" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Integrations</p>
              <p className="text-3xl font-bold text-blue-500">{stats?.total_integrations || 0}</p>
            </div>
            <GlobeAltIcon className="w-12 h-12 text-blue-500/30" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">System Status</p>
              <p className="text-lg font-bold text-green-500">Online</p>
            </div>
            <ServerIcon className="w-12 h-12 text-green-500/30" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Difficulty Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Difficulty Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Top Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(10,10,10,0.8)', 
                  border: '1px solid rgba(255,107,53,0.3)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#ff6b35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Template Search and Browse Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-xl p-6 xl:col-span-2"
        >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold runic-text">🔍 Template Search & Browse</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveView(activeView === 'search' ? 'overview' : 'search')}
              className={`btn-runic flex items-center space-x-2 ${activeView === 'search' ? 'runic-glow' : ''}`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span>{activeView === 'search' ? 'Close Search' : 'Advanced Search'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search 4000+ templates... (e.g. 'email automation', 'slack notification')"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-runeflow-500/30 bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:border-runeflow-500 focus:ring-1 focus:ring-runeflow-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="spinner w-5 h-5"></div>
              </div>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                handleFilterChange()
              }}
              className="w-full px-3 py-2 glass rounded-lg border border-gray-600 bg-black/20 text-white focus:outline-none focus:border-runeflow-500"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name} ({category.template_count})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value)
                handleFilterChange()
              }}
              className="w-full px-3 py-2 glass rounded-lg border border-gray-600 bg-black/20 text-white focus:outline-none focus:border-runeflow-500"
            >
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'All' ? 'All Levels' : difficulty}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                handleFilterChange()
              }}
              className="w-full px-3 py-2 glass rounded-lg border border-gray-600 bg-black/20 text-white focus:outline-none focus:border-runeflow-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">View</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-runeflow-500 text-white'
                    : 'glass border border-gray-600 text-gray-400 hover:text-white'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-runeflow-500 text-white'
                    : 'glass border border-gray-600 text-gray-400 hover:text-white'
                }`}
              >
                <ListBulletIcon className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {searchResults.length > 0 ? (
                  <>Found <span className="text-runeflow-500 font-bold">{searchResults.length}</span> templates matching "{searchQuery}"</>
                ) : (
                  <>No templates found matching "{searchQuery}"</>
                )}
              </span>
              {isSearching && <div className="spinner w-4 h-4"></div>}
            </div>
            <button
              onClick={() => handleSearch('')}
              className="text-xs text-gray-500 hover:text-white"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Templates Display */}
        <div className="space-y-4">
          {searchQuery ? (
            // Search Results
            searchResults.length > 0 ? (
              <TemplateGrid templates={searchResults} viewMode={viewMode} onTemplateClick={handleTemplateClick} onTemplateCopy={copyTemplateData} />
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg mb-2">No templates found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms or filters</p>
              </div>
            )
          ) : (
            // All Templates with Pagination
            <div>
              <TemplateGrid templates={templates} viewMode={viewMode} onTemplateClick={handleTemplateClick} onTemplateCopy={copyTemplateData} />
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} templates
                  </span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="px-2 py-1 glass rounded border border-gray-600 bg-black/20 text-white text-sm"
                  >
                    {PAGE_SIZES.map(size => (
                      <option key={size} value={size}>{size} per page</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="p-2 glass rounded border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-runeflow-500"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-1 glass rounded border border-runeflow-500 text-runeflow-500">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="p-2 glass rounded border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-runeflow-500"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </motion.div>

        {/* Template Details Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-xl p-6 xl:col-span-1"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold runic-text">📋 Template Details</h3>
            {selectedTemplate && (
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {selectedTemplate ? (
            <div className="space-y-4">
              {/* Template Header */}
              <div className="border-b border-gray-700 pb-4">
                <h4 className="font-bold text-runeflow-400 mb-2 leading-tight">
                  {selectedTemplate.name}
                </h4>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-400">{selectedTemplate.category_name}</span>
                  <span className="text-gray-500">•</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedTemplate.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    selectedTemplate.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedTemplate.difficulty}
                  </span>
                </div>
              </div>

              {/* Template Description */}
              <div>
                <h5 className="text-sm font-semibold text-gray-400 mb-2">Description</h5>
                <p className="text-sm text-white leading-relaxed">{selectedTemplate.description}</p>
              </div>

              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h6 className="text-xs text-gray-400 mb-1">Downloads</h6>
                  <p className="text-lg font-bold text-runeflow-500">{selectedTemplate.download_count}</p>
                </div>
                <div>
                  <h6 className="text-xs text-gray-400 mb-1">Rating</h6>
                  <p className="text-lg font-bold text-runic-gold-500">⭐ {parseFloat(selectedTemplate.rating).toFixed(1)}</p>
                </div>
                <div>
                  <h6 className="text-xs text-gray-400 mb-1">File Size</h6>
                  <p className="text-sm text-white">{selectedTemplate.file_size}</p>
                </div>
                <div>
                  <h6 className="text-xs text-gray-400 mb-1">Setup Time</h6>
                  <p className="text-sm text-white">{selectedTemplate.estimated_setup_time}</p>
                </div>
              </div>

              {/* Integrations */}
              {selectedTemplate.integrations && selectedTemplate.integrations.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-400 mb-2">Integrations</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.integrations.slice(0, 6).map((integration, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {integration}
                      </span>
                    ))}
                    {selectedTemplate.integrations.length > 6 && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                        +{selectedTemplate.integrations.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tabs Navigation */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setActiveDetailTab('info')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      activeDetailTab === 'info'
                        ? 'bg-runeflow-500/20 text-runeflow-400 border border-runeflow-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <InformationCircleIcon className="w-4 h-4" />
                    <span>Info</span>
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('code')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      activeDetailTab === 'code'
                        ? 'bg-runeflow-500/20 text-runeflow-400 border border-runeflow-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CodeBracketIcon className="w-4 h-4" />
                    <span>Code</span>
                  </button>
                </div>

                {/* Tab Content */}
                {activeDetailTab === 'code' ? (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <CodeBracketIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400 text-sm mb-2">Code Explorer</p>
                      <p className="text-gray-500 text-xs mb-4">Browse template files and structure</p>
                      <div className="glass rounded-lg p-4 space-y-3">
                      {filesLoading ? (
                        <div className="text-center py-8">
                          <div className="spinner w-8 h-8 mx-auto mb-4" />
                          <p className="text-gray-400">Loading files...</p>
                        </div>
                      ) : templateFiles && templateFiles.length > 0 ? (
                        <div className="space-y-2">
                          {templateFiles.map((file: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 text-xs">
                              {file.type === 'directory' ? (
                                <FolderIcon className="w-4 h-4 text-blue-400" />
                              ) : (
                                <DocumentIcon className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-gray-300">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CodeBracketIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                          <p className="text-gray-400">No files found in this template.</p>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">Template information and metadata</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={() => window.open(`/api/v1/templates/${selectedTemplate.id}/download`, '_blank')}
                  className="w-full px-4 py-3 bg-runeflow-500 hover:bg-runeflow-600 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <CloudArrowDownIcon className="w-5 h-5" />
                  <span>Download Template</span>
                </button>
                <button
                  onClick={() => copyTemplateData(selectedTemplate)}
                  className="w-full px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>Copy Data</span>
                </button>
              </div>

              {/* Template ID */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  Template ID: {selectedTemplate.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <InformationCircleIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg mb-2">No Template Selected</p>
              <p className="text-gray-500 text-sm">Click on any template to view its details</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Recent Templates</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Difficulty</th>
                <th className="text-left py-2">Downloads</th>
                <th className="text-left py-2">Rating</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.slice(0, 8).map((template, index) => (
                <motion.tr
                  key={template.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="border-b border-gray-800 hover:bg-white/5 relative cursor-pointer"
                  onClick={() => handleTemplateClick(template)}
                >
                  <td className="py-3 font-medium relative">
                    <div className="flex items-center space-x-2">
                      <span>{template.name.substring(0, 60)}...</span>
                      <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </td>
                  <td className="py-3 text-gray-400">{template.category_name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {template.difficulty}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{template.download_count}</td>
                  <td className="py-3 text-gray-400">⭐ {parseFloat(template.rating).toFixed(1)}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyTemplateData(template)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Copy template data"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                      <button
                        onClick={() => window.open(`/api/v1/templates/${template.id}/download`, '_blank')}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Download template"
                      >
                        <CloudArrowDownIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  )
}
