import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface TeamMember {
  userId: string;
  role: string;
}

interface TeamMemberSelectorProps {
  value: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  availableUsers: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  error?: string;
}

export function TeamMemberSelector({
  value,
  onChange,
  availableUsers,
  error,
}: TeamMemberSelectorProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleAddMember = () => {
    if (selectedUserId && selectedRole) {
      const newMember = {
        userId: selectedUserId,
        role: selectedRole,
      };
      onChange([...value, newMember]);
      setSelectedUserId('');
      setSelectedRole('');
    }
  };

  const handleRemoveMember = (userId: string) => {
    onChange(value.filter((member) => member.userId !== userId));
  };

  const getMemberName = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select
          value={selectedUserId}
          onValueChange={setSelectedUserId}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select Team Member" />
          </SelectTrigger>
          <SelectContent>
            {availableUsers
              .filter(
                (user) =>
                  !value.some((member) => member.userId === user.id)
              )
              .map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-40"
        />

        <Button
          type="button"
          onClick={handleAddMember}
          disabled={!selectedUserId || !selectedRole}
        >
          Add
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        {value.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
          >
            <div>
              <span className="font-medium">{getMemberName(member.userId)}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({member.role})
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveMember(member.userId)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 