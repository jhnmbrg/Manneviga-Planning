import React, { useState } from 'react';
import { TodoTask } from '../types';
import { TASK_CATEGORIES, FAMILIES } from '../constants';
import { CheckCircle2, Circle, Plus, Trash2, Hammer, Anchor, User, AlertTriangle } from 'lucide-react';
import { supabase, TABLES } from '../supabaseClient';

interface TodoManagerProps {
  tasks: TodoTask[];
  setTasks: React.Dispatch<React.SetStateAction<TodoTask[]>>;
}

const ASSIGNEE_OPTIONS = ['Anyone', ...FAMILIES.map(f => f.name)];

const TodoManager: React.FC<TodoManagerProps> = ({ tasks }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(TASK_CATEGORIES[0]);
  const [assignee, setAssignee] = useState('Anyone');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [note, setNote] = useState('');

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const id = Date.now().toString();
    const newTask: TodoTask = {
      id,
      text: newTaskText.trim(),
      category: selectedCategory,
      completed: false,
      createdAt: Date.now(),
      assignee,
      priority,
      note: note.trim() || undefined,
    };

    const { error } = await supabase.from(TABLES.tasks).insert({
      ...newTask,
      note: newTask.note ?? null,
    });
    if (error) return console.error('Error adding task:', error.message);

    // Reset the entry fields; keep Area and Responsible sticky for quick repeat entry.
    setNewTaskText('');
    setNote('');
    setPriority('normal');
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
    items: tasks.filter(t => t.category === cat),
  }));

  const labelClass = 'text-[11px] uppercase font-black text-slate-500 tracking-widest block mb-2';

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

        <form onSubmit={addTask} className="p-8 bg-sky-50/30 border-b border-sky-50 space-y-6">
          <div>
            <label className={labelClass}>What needs doing?</label>
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="e.g. Replace the broken plank on the pier"
              className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-teal-400 outline-none transition-all shadow-sm bg-white text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Area</label>
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

            <div>
              <label className={labelClass}>Responsible</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border-2 border-transparent focus:border-teal-400 outline-none transition-all shadow-sm bg-white text-sm font-bold text-sky-900"
              >
                {ASSIGNEE_OPTIONS.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <div className="flex gap-2 h-[52px]">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`flex-1 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${priority === 'normal' ? 'bg-sky-900 text-white border-sky-900' : 'bg-white text-slate-400 border-slate-100 hover:border-sky-200'}`}
                >
                  Whenever
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`flex-1 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-1.5 ${priority === 'urgent' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400 border-slate-100 hover:border-red-200'}`}
                >
                  <AlertTriangle size={14} /> Urgent
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Extra details <span className="text-slate-300 normal-case font-bold tracking-normal">(optional)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. The third plank from the left, behind Skipbua. Spare wood is in the boathouse."
              className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-teal-400 outline-none transition-all shadow-sm bg-white text-sm min-h-[80px]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-10 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-teal-700 transition-all active:scale-95 shadow-md shadow-teal-600/20"
          >
            <Plus size={18} /> Add Task
          </button>
        </form>

        <div className="p-8 space-y-12">
          {categorizedTasks.map(cat => (
            <div key={cat.name} className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-700 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                {cat.name}
              </h3>

              <div className="space-y-3">
                {cat.items.length > 0 ? (
                  cat.items.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-4 p-5 rounded-2xl border transition-all group ${
                        task.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-sky-100 hover:border-teal-200 shadow-sm'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 transition-colors ${task.completed ? 'text-teal-500' : 'text-slate-300 hover:text-teal-400'}`}
                        aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                      >
                        {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.priority === 'urgent' && !task.completed && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              <AlertTriangle size={12} /> Urgent
                            </span>
                          )}
                          <span className={`text-base font-medium ${task.completed ? 'text-slate-400 line-through italic' : 'text-sky-900'}`}>
                            {task.text}
                          </span>
                        </div>

                        {task.note && (
                          <p className={`text-sm mt-1.5 leading-relaxed ${task.completed ? 'text-slate-300' : 'text-slate-500'}`}>
                            {task.note}
                          </p>
                        )}

                        {task.assignee && task.assignee !== 'Anyone' && (
                          <div className="mt-2.5">
                            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                              <User size={13} /> {task.assignee}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-300 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Delete task"
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
