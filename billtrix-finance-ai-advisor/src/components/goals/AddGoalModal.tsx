import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (goal: { name: string; target: number; current: number; deadline: string }) => Promise<void>;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!name || !target || !deadline) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    try {
      await onAdd({
        name,
        target: Number(target),
        current: Number(current) || 0,
        deadline,
      });
      setName('');
      setTarget('');
      setCurrent('');
      setDeadline('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add New Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Goal Name</label>
              <Input type="text" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Target Amount (₹)</label>
              <Input type="number" required min="1" value={target} onChange={e => setTarget(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Current Saved (₹)</label>
              <Input type="number" required min="0" value={current} onChange={e => setCurrent(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 font-medium">Deadline</label>
              <Input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2 mt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Goal'}</Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddGoalModal;
