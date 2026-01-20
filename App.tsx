
import React, { useState, useEffect, useMemo } from 'react';
import { User, Task, TaskStatus, ViewTab } from './types';
import { CircularCheckbox } from './components/CircularCheckbox';

// Mock initial data
const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Restock the coffee station', description: 'Make sure there are enough beans and milk.', status: 'available', createdBy: 'system', createdAt: Date.now() - 3600000 },
  { id: '2', title: 'Update project roadmap', description: 'Review Q4 goals and adjust timelines.', status: 'available', createdBy: 'system', createdAt: Date.now() - 7200000 },
];

const MOCK_LEADERBOARD = [
  { name: 'Alex Rivera', points: 12 },
  { name: 'Sam Chen', points: 8 },
  { name: 'Jordan Smith', points: 5 },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>('available');
  const [isSignInOpen, setIsSignInOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Persist state to local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('syncTask_user');
    const savedTasks = localStorage.getItem('syncTask_tasks');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsSignInOpen(false);
    }
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(INITIAL_TASKS);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('syncTask_user', JSON.stringify(currentUser));
    }
    localStorage.setItem('syncTask_tasks', JSON.stringify(tasks));
  }, [currentUser, tasks]);

  const handleSignIn = (name: string, email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      points: 0,
      canCreateTasks: true
    };
    setCurrentUser(newUser);
    setIsSignInOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('syncTask_user');
    setCurrentUser(null);
    setIsSignInOpen(true);
  };

  const createTask = () => {
    if (!newTaskTitle.trim() || !currentUser) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      description: '',
      status: 'available',
      createdBy: currentUser.id,
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setIsCreateModalOpen(false);
  };

  const claimTask = (taskId: string) => {
    if (!currentUser) return;
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'claimed' as TaskStatus, claimedBy: currentUser.id, claimedByName: currentUser.name } 
        : t
    ));
    setActiveTab('my-tasks');
  };

  const unclaimTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'available' as TaskStatus, claimedBy: undefined, claimedByName: undefined } 
        : t
    ));
  };

  const completeTask = (taskId: string) => {
    if (!currentUser) return;
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'completed' as TaskStatus } 
        : t
    ));
    setCurrentUser(prev => prev ? { ...prev, points: prev.points + 1 } : null);
  };

  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'available':
        // Show both available and claimed tasks in the shared list
        return tasks.filter(t => t.status === 'available' || t.status === 'claimed');
      case 'my-tasks':
        return tasks.filter(t => t.status === 'claimed' && t.claimedBy === currentUser?.id);
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      default:
        return tasks;
    }
  }, [tasks, activeTab, currentUser]);

  const leaderboardEntries = useMemo(() => {
    const entries = [...MOCK_LEADERBOARD];
    if (currentUser) {
      entries.push({ name: `${currentUser.name} (You)`, points: currentUser.points });
    }
    return entries.sort((a, b) => b.points - a.points);
  }, [currentUser]);

  if (isSignInOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">SyncTask</h1>
            <p className="text-gray-400 mt-2 text-sm">Minimal group productivity</p>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSignIn(formData.get('name') as string, formData.get('email') as string);
            }}
            className="space-y-4"
          >
            <input 
              required
              name="name"
              placeholder="Full Name" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
            <input 
              required
              name="email"
              type="email"
              placeholder="Email address" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
            <button 
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 py-12 relative">
      {/* Header */}
      <header className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">SyncTask</h1>
          <p className="text-gray-500 mt-1">Hey, {currentUser?.name.split(' ')[0]}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLeaderboardOpen(true)}
              className="text-sm font-medium text-gray-400 hover:text-black transition-colors"
            >
              Leaderboard
            </button>
            <div className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <span>Points</span>
              <span className="w-px h-3 bg-white/30"></span>
              <span className="tabular-nums">{currentUser?.points || 0}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs text-gray-400 mt-2 hover:text-black transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-8 border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar">
        {[
          { id: 'available', label: 'Tasks' },
          { id: 'my-tasks', label: 'My Tasks' },
          { id: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ViewTab)}
            className={`pb-4 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No tasks here yet.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className="group bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-5 hover:border-gray-200 hover:shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex-shrink-0">
                <CircularCheckbox 
                  checked={task.status === 'completed'}
                  onChange={() => completeTask(task.id)}
                  disabled={task.status !== 'claimed' || task.claimedBy !== currentUser?.id}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-gray-900 truncate ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </h3>
                {task.status === 'available' && (
                  <p className="text-xs text-gray-400 mt-1">Available to claim</p>
                )}
                {task.status === 'claimed' && (
                  <p className={`text-xs mt-1 ${task.claimedBy === currentUser?.id ? 'text-blue-500' : 'text-gray-400'}`}>
                    {task.claimedBy === currentUser?.id ? 'You are working on this' : `Claimed by ${task.claimedByName}`}
                  </p>
                )}
                {task.status === 'completed' && (
                  <p className="text-xs text-green-500 mt-1">Finished</p>
                )}
              </div>
              
              {/* Actions for Available Tab */}
              {activeTab === 'available' && task.status === 'available' && (
                <button
                  onClick={() => claimTask(task.id)}
                  className="px-4 py-2 bg-gray-50 text-gray-900 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                >
                  Claim
                </button>
              )}

              {/* Actions for My Tasks Tab */}
              {activeTab === 'my-tasks' && task.status === 'claimed' && (
                <button
                  onClick={() => unclaimTask(task.id)}
                  className="px-4 py-2 text-gray-400 text-xs font-medium rounded-lg hover:text-red-500 transition-colors"
                >
                  Release
                </button>
              )}
            </div>
          ))
        )}
      </main>

      {/* Create Button (Sticky) */}
      {currentUser?.canCreateTasks && (
        <div className="fixed bottom-10 right-10">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsLeaderboardOpen(false)}></div>
          <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold mb-6">Leaderboard</h2>
            <div className="space-y-4">
              {leaderboardEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-300 w-4">{idx + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{entry.points} pts</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsLeaderboardOpen(false)}
              className="w-full mt-8 py-3 bg-gray-50 text-gray-900 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for Creating Task */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold mb-6">Create new task</h2>
            <div className="space-y-6">
              <input
                autoFocus
                type="text"
                placeholder="What needs to be done?"
                className="w-full text-lg border-b border-gray-100 pb-2 focus:outline-none focus:border-black transition-colors"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createTask()}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
