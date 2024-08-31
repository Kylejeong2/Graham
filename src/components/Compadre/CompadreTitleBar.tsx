'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Common/Button';
import DeleteButton from '@/components/Common/DeleteButton';

type Props = {
  compadre: {
    userId: string;
    id: string;
    name: string;
    characteristics: string[] | null;
    createdAt: Date;
    imageUrl: string | null;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export const CompadreTitleBar: React.FC<Props> = ({ compadre, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [compadreState, setCompadreState] = useState(compadre);
  const [newName, setNewName] = useState(compadre.name || '');
  const [newCharacteristics, setNewCharacteristics] = useState(
    Array.isArray(compadre.characteristics) ? compadre.characteristics.join(', ') : ''
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCompadreState(compadre);
    setNewName(compadre.name || '');
    setNewCharacteristics(
      Array.isArray(compadre.characteristics) ? compadre.characteristics.join(', ') : ''
    );
  }, [compadre]);

  const handleSave = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/editCompadre/${compadreState.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          characteristics: newCharacteristics.split(',').map(c => c.trim()).filter(c => c !== ''),
        }),
      });

      if (response.status === 200) {
        const updatedCompadre = await response.json();
        // Update local state correctly
        setCompadreState(prevState => ({
          ...prevState,
          name: updatedCompadre.name,
          characteristics: updatedCompadre.characteristics,
        }));
        // Update the state variables as well
        // setNewName(updatedCompadre.name);
        // setNewCharacteristics(Array.isArray(updatedCompadre.characteristics) ? updatedCompadre.characteristics.join(', ') : '');
        window.location.reload();
        window.addEventListener('load', () => {
          setIsEditing(false);
        }, { once: true });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update compadre');
      }
    } catch (error) {
      console.error('Error updating compadre:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className='border shadow-xl border-stone-200 rounded-lg p-4 flex items-center'>
      <Link href="/dashboard" replace>
        <Button className="bg-green-600" size="sm">
          Back
        </Button>
      </Link>
      <div className="w-3"></div>
      <span className='font-semibold'>
        {user ? `${user.firstName || ''} ${user.lastName || ''}` : 'User'}
      </span>
      <span className='inline-block mx-1'>|</span>
      <span className='font-semibold'>
        Compadre Name:&nbsp;
      </span>
      {isEditing ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 mx-2"
        />
      ) : (
        <span className='text-stone-500 font-semibold'>
          {compadreState.name}
        </span>
      )}
      <span className='inline-block mx-1'>|</span>
      <span className='font-semibold'>
        Characteristics:&nbsp;
      </span>
      {isEditing ? (
        <input
          type="text"
          value={newCharacteristics}
          onChange={(e) => setNewCharacteristics(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 flex-grow mx-2"
        />
      ) : (
        <span className='text-stone-500 font-semibold'>
          [ {Array.isArray(compadreState.characteristics) ? compadreState.characteristics.join(', ') : 'None'} ]
        </span>
      )}
      <div className="ml-auto flex items-center">
        {isEditing ? (
          <>
            <Button onClick={handleSave} className="bg-blue-600 mr-2" size="sm">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} className="bg-gray-600 mr-2" size="sm">
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="bg-yellow-400 mr-2" size="sm">
            Edit
          </Button>
        )}
        <DeleteButton compadreId={compadreState.id}/>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}