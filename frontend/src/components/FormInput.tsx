import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegisterReturn;
  type?: 'text' | 'email' | 'password';
  prefix?: string;
}

export default function FormInput({
  id,
  label,
  placeholder,
  error,
  register,
  type = 'text',
  prefix,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {prefix ? (
        <div className="flex items-center">
          <span className="text-gray-500 text-sm mr-2">{prefix}</span>
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            {...register}
            className={`flex-1 px-4 py-3 bg-transparent border-b-2 focus:outline-none transition-colors placeholder-gray-400 text-gray-900 ${
              error ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'
            }`}
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...register}
          className={`w-full px-4 py-3 bg-transparent border-b-2 focus:outline-none transition-colors placeholder-gray-400 text-gray-900 ${
            error ? 'border-red-500' : 'border-gray-300 focus:border-gray-900'
          }`}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
