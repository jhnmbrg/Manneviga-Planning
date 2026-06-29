
import React, { useState } from 'react';
import { TodoTask } from '../types';
import { TASK_CATEGORIES } from '../constants';
import { CheckCircle2, Circle, Plus, Trash2, Hammer, Ship, Anchor } from 'lucide-react';
import { supabase, TABLES } from '../supabaseClient';

interface TodoManagerProps {
  tasks: TodoTask[];
  setTasks: React.Dispatch<React.SetStateAction<TodoTask[]>>;
}

const TodoManager: React.FC<TodoManagerProps> = ({ tasks, setTasks }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(TASK_CATEGORIES[0]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const id = Date.now().toString();
    const newTask: TodoTask = {
      id,
      text: newTaskText.trim(),
      category: selectedCategory,
      completed: false,
      createdAt: Date.now()
    };

    const { error } = await supabase.from(TABLES.tasks).insert(newTask);
    if (error) return console.error('Error adding task:', error.message);
    setNewTaskText('');
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const { error } = await supabase.from(TABLES.tasks).update({ completed: !task.completed }).eq('id', id);
    if (error) console.error('Error updating task:', error.message);
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from(TABLES.tasks).delete().eq('id', id);
    if (error) console.error('Error deleting task:', error.message);
  };

  const categorizedTasks = TASK_CATEGORIES.map(cat => ({
    name: cat,
    items: tasks.filter(t => t.category === cat)
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-sky-50">
        <div className="bg-sky-900 p-8 text-white flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold italic serif-font">Manneviga Tasks</h2>
            <p className="text-sky-200 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Preservation and Maintenance Log</p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl">
            <Hammer className="text-sky-200" size={32} />
          </div>
        </div>

        <form onSubmit={addTask} className="p-8 bg-sky-50/30 border-b border-sky-50 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What task needs to be performed?"
              className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-teal-400 outline-none transition-all shadow-sm bg-white text-sm"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border-2 border-transparent focus:border-teal-400 outline-none transition-all shadow-sm bg-white text-sm font-bold text-sky-900"
            >
              {TASK_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-teal-700 transition-all active:scale-95 shadow-md shadow-teal-600/20"
          >
            <Plus size={18} /> Add Entry
          </button>
        </form>

        <div className="p-8 space-y-12">
          {categorizedTasks.map(cat => (
            <div key={cat.name} className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                {cat.name}
              </h3>
              
              <div className="space-y-2">
                {cat.items.length > 0 ? (
                  cat.items.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                        task.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-sky-100 hover:border-teal-200 shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`transition-colors ${task.completed ? 'text-teal-500' : 'text-slate-300 hover:text-teal-400'}`}
                      >
                        {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      
                      <span className={`flex-1 text-sm font-medium ${task.completed ? 'text-slate-400 line-through italic' : 'text-sky-900'}`}>
                        {task.text}
                      </span>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-300 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-6 px-4 border-2 border-dashed border-sky-50 rounded-2xl text-center">
                    <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest">Post is currently Clear</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center gap-12 text-slate-400 border-t border-sky-100 pt-8">
        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest">
          <Anchor size={16} className="text-sky-300" /> {tasks.filter(t => !t.completed).length} Logs Pending
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest">
          <CheckCircle2 size={16} className="text-teal-400" /> {tasks.filter(t => t.completed).length} Tasks Sealed
        </div>
      </div>
    </div>
  );
};

export default TodoManager;
