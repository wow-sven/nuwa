import { useEffect, useState } from 'react';
import { TaskSpecification } from '../types/taska';
import { createEmptyTaskSpec } from '../utils/task';
import { TaskSpecForm } from './TaskSpecForm';

interface TaskSpecificationEditorProps {
  jsonMode?: boolean;
  taskSpecs: TaskSpecification[];
  onChange: (specs: TaskSpecification[]) => void;
  onCancel: () => void;
}

export function TaskSpecificationEditor({ 
  jsonMode = false,
  taskSpecs, 
  onChange, 
  onCancel 
}: TaskSpecificationEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {jsonMode ? (
        <div>
          <textarea
            className="w-full h-96 font-mono text-sm p-4 border rounded"
            value={JSON.stringify(taskSpecs, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed)
                setJsonError(null);
              } catch (error) {
                if (error instanceof Error) {
                  setJsonError(error.message);
                } else {
                  setJsonError('Invalid JSON format');
                }
              }
            }}
          />
          {jsonError && (
            <p className="text-red-500 text-sm mt-2">{jsonError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {taskSpecs.map((spec, index) => (
            <TaskSpecForm
              key={index}
              spec={spec}
              onChange={(updated) => {
                const newSpecs = [...taskSpecs];
                newSpecs[index] = updated;
                onChange(newSpecs);
              }}
              onRemove={() => {
                const newSpecs = taskSpecs.filter((_, i) => i !== index);
                onChange(newSpecs);
              }}
            />
          ))}
        </div>
      )}

      {/* <div className="flex justify-end space-x-4 mt-4">
        <button
          onClick={() => onCancel()}
          className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(specs)}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div> */}
    </div>
  );
}
