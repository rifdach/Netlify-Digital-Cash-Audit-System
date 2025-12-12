import React, { useState } from 'react';
import { KKPStatus, UserRole, Task, ChatMessage } from '../types';
import { MessageSquare, CheckSquare, Clock, ShieldCheck, Send } from 'lucide-react';

const WorkflowManager: React.FC = () => {
  const [kkpStatus, setKkpStatus] = useState<KKPStatus>(KKPStatus.IN_PROGRESS);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.SENIOR); // Mock role switcher

  const [tasks] = useState<Task[]>([
    { id: '1', title: 'Collect Bank Statements', assignee: 'Junior A', status: 'DONE', dueDate: '2023-10-01' },
    { id: '2', title: 'Verify Petty Cash', assignee: 'Senior B', status: 'DOING', dueDate: '2023-10-05' },
    { id: '3', title: 'Confirm Receivables', assignee: 'Junior A', status: 'TODO', dueDate: '2023-10-10' },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Partner', content: 'Please focus on the high-value transaction in March.', timestamp: '10:00 AM' },
    { id: '2', sender: 'Senior B', content: 'Noted. I have flagged it in the Vouching Worksheet.', timestamp: '10:05 AM' },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setNewMessage('');
  };

  const getStatusColor = (status: KKPStatus) => {
    switch (status) {
      case KKPStatus.DRAFT: return 'bg-gray-200 text-gray-700';
      case KKPStatus.IN_PROGRESS: return 'bg-blue-200 text-blue-800';
      case KKPStatus.FINISH: return 'bg-purple-200 text-purple-800';
      case KKPStatus.APPROVED: return 'bg-green-200 text-green-800';
    }
  };

  const canApprove = currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.PARTNER;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Column 1: KKP Status & ATLAS Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-600">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            KKP Status (ATLAS)
          </h3>
          <div className="mb-4">
            <span className={`px-4 py-2 rounded-full font-bold ${getStatusColor(kkpStatus)} block text-center`}>
              {kkpStatus}
            </span>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Simulate Role</label>
            <select 
              className="w-full border p-2 rounded text-sm mb-4"
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setKkpStatus(KKPStatus.IN_PROGRESS)}
                className="bg-gray-100 hover:bg-gray-200 text-sm py-2 rounded"
                disabled={kkpStatus === KKPStatus.APPROVED}
              >
                In Progress
              </button>
              <button 
                onClick={() => setKkpStatus(KKPStatus.FINISH)}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm py-2 rounded border border-blue-200"
                disabled={kkpStatus === KKPStatus.APPROVED}
              >
                Finish
              </button>
              <button 
                onClick={() => setKkpStatus(KKPStatus.APPROVED)}
                disabled={!canApprove}
                className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canApprove ? 'Approve KKP' : 'Approval Locked (Mgr/Partner Only)'}
              </button>
            </div>
          </div>
        </div>

        {/* Task Management */}
        <div className="bg-white p-6 rounded-lg shadow">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <CheckSquare className="w-5 h-5 text-slate-600" />
             Audit Tasks
           </h3>
           <ul className="space-y-3">
             {tasks.map(task => (
               <li key={task.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                 <div>
                   <p className="text-sm font-medium">{task.title}</p>
                   <p className="text-xs text-gray-500">{task.assignee} • Due {task.dueDate}</p>
                 </div>
                 <span className={`text-[10px] px-2 py-1 rounded font-bold ${task.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                   {task.status}
                 </span>
               </li>
             ))}
           </ul>
        </div>
      </div>

      {/* Column 2: Collaboration/Chat */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col h-[500px]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-lg">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Team Collaboration
          </h3>
          <span className="text-xs text-gray-500">Secure • Encrypted</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.sender === 'You' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{msg.sender}, {msg.timestamp}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input 
            type="text" 
            className="flex-1 border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your findings or comments..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;
