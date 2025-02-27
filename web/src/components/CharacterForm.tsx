import { useState } from 'react';
import { Character } from '../types/agent';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CharacterFormProps {
  onSubmit: (character: Character) => void;
  initialValue?: Character;
}

export function CharacterForm({ onSubmit, initialValue }: CharacterFormProps) {
  const [character, setCharacter] = useState<Character>(initialValue || {
    name: '',
    username: '',
    description: '',
    bio: [''],
    knowledge: [''],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof Character, value: string | string[]) => {
    setCharacter((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArrayItemChange = (field: 'bio' | 'knowledge', index: number, value: string) => {
    const newArray = [...character[field]];
    newArray[index] = value;
    handleChange(field, newArray);
  };

  const addArrayItem = (field: 'bio' | 'knowledge') => {
    handleChange(field, [...character[field], '']);
  };

  const removeArrayItem = (field: 'bio' | 'knowledge', index: number) => {
    const newArray = [...character[field]];
    newArray.splice(index, 1);
    handleChange(field, newArray);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!character.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!character.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-z0-9_]+$/.test(character.username)) {
      newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores';
    }
    
    if (!character.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Validate bio and knowledge items are not empty
    character.bio.forEach((item, index) => {
      if (!item.trim()) {
        newErrors[`bio_${index}`] = 'Bio item cannot be empty';
      }
    });
    
    character.knowledge.forEach((item, index) => {
      if (!item.trim()) {
        newErrors[`knowledge_${index}`] = 'Knowledge item cannot be empty';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Filter out empty items
      const filteredBio = character.bio.filter(item => item.trim() !== '');
      const filteredKnowledge = character.knowledge.filter(item => item.trim() !== '');
      
      onSubmit({
        ...character,
        bio: filteredBio,
        knowledge: filteredKnowledge,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Create Autonomous AI Entity</h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={character.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          placeholder="e.g., Aria"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
            @
          </span>
          <input
            type="text"
            id="username"
            value={character.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={`flex-1 min-w-0 px-3 py-2 border ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            } rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500`}
            placeholder="username"
          />
        </div>
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={character.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          placeholder="An autonomous AI entity with unique capabilities and perspectives..."
        ></textarea>
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio (Personality traits and background)
        </label>
        {character.bio.map((item, index) => (
          <div key={`bio_${index}`} className="flex mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayItemChange('bio', index, e.target.value)}
              className={`flex-1 px-3 py-2 border ${
                errors[`bio_${index}`] ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              placeholder="e.g., Friendly and helpful"
            />
            {character.bio.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('bio', index)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('bio')}
          className="mt-1 flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add bio trait
        </button>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Knowledge (Skills and expertise)
        </label>
        {character.knowledge.map((item, index) => (
          <div key={`knowledge_${index}`} className="flex mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayItemChange('knowledge', index, e.target.value)}
              className={`flex-1 px-3 py-2 border ${
                errors[`knowledge_${index}`] ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              placeholder="e.g., Programming"
            />
            {character.knowledge.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('knowledge', index)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('knowledge')}
          className="mt-1 flex items-center text-sm text-blue-600 hover:text-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add knowledge area
        </button>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </form>
  );
}
