import React, { useState } from 'react';

interface Replacement {
  selector: string;
  content: string;
}

export interface SourceFormData {
  name: string;
  rule_type: 'referrer_contains' | 'url_param_equals';
  rule_value: string;
  param_name: string;
  param_value: string;
  replacements: Replacement[];
  priority: number;
  active: boolean;
}

interface SourceFormProps {
  initialData?: SourceFormData;
  onSubmit: (data: SourceFormData) => void;
  isSubmitting: boolean;
}

// Default empty form data
const defaultFormData: SourceFormData = {
  name: '',
  rule_type: 'referrer_contains',
  rule_value: '',
  param_name: '',
  param_value: '',
  replacements: [{ selector: '', content: '' }],
  priority: 1,
  active: true
};

// Component for creating/editing personalization sources
const SourceForm: React.FC<SourceFormProps> = ({
  initialData = defaultFormData,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<SourceFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Handle input change for basic fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'priority' ? parseInt(value, 10) : value
    });
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle rule type change
  const handleRuleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      rule_type: value as 'referrer_contains' | 'url_param_equals',
      // Reset param fields if changing from url_param_equals to referrer_contains
      ...(value === 'referrer_contains' ? { param_name: '', param_value: '' } : {})
    });
  };

  // Handle replacement selector change
  const handleReplacementSelectorChange = (index: number, value: string) => {
    const newReplacements = [...formData.replacements];
    newReplacements[index].selector = value;
    setFormData({
      ...formData,
      replacements: newReplacements
    });
    
    // Clear validation error
    const errorKey = `replacements[${index}].selector`;
    if (validationErrors[errorKey]) {
      setValidationErrors({
        ...validationErrors,
        [errorKey]: ''
      });
    }
  };

  // Handle replacement content change
  const handleReplacementContentChange = (index: number, value: string) => {
    const newReplacements = [...formData.replacements];
    newReplacements[index].content = value;
    setFormData({
      ...formData,
      replacements: newReplacements
    });
    
    // Clear validation error
    const errorKey = `replacements[${index}].content`;
    if (validationErrors[errorKey]) {
      setValidationErrors({
        ...validationErrors,
        [errorKey]: ''
      });
    }
  };

  // Add a new replacement
  const handleAddReplacement = () => {
    setFormData({
      ...formData,
      replacements: [...formData.replacements, { selector: '', content: '' }]
    });
  };

  // Remove a replacement
  const handleRemoveReplacement = (index: number) => {
    // Don't remove if it's the only one
    if (formData.replacements.length <= 1) return;
    
    const newReplacements = formData.replacements.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      replacements: newReplacements
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Basic field validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.rule_value.trim()) {
      errors.rule_value = 'Rule value is required';
    }
    
    // URL parameter validation
    if (formData.rule_type === 'url_param_equals') {
      if (!formData.param_name.trim()) {
        errors.param_name = 'Parameter name is required';
      }
      if (!formData.param_value.trim()) {
        errors.param_value = 'Parameter value is required';
      }
    }
    
    // Replacement validation
    formData.replacements.forEach((replacement, index) => {
      if (!replacement.selector.trim()) {
        errors[`replacements[${index}].selector`] = 'Selector is required';
      }
      if (!replacement.content.trim()) {
        errors[`replacements[${index}].content`] = 'Content is required';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Check if field has error
  const hasError = (fieldName: string): boolean => !!validationErrors[fieldName];

  // Get error message for field
  const getErrorMessage = (fieldName: string): string => validationErrors[fieldName] || '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Source Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
              hasError('name') ? 'border-red-300' : ''
            }`}
            placeholder="e.g., Facebook Traffic"
            aria-label="Source name"
            tabIndex={0}
          />
          {hasError('name') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('name')}</p>
          )}
        </div>
      </div>

      {/* Rule Type field */}
      <div>
        <label htmlFor="rule_type" className="block text-sm font-medium text-gray-700">
          Rule Type
        </label>
        <div className="mt-1">
          <select
            id="rule_type"
            name="rule_type"
            value={formData.rule_type}
            onChange={handleRuleTypeChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            aria-label="Rule type"
            tabIndex={0}
          >
            <option value="referrer_contains">Referrer Contains</option>
            <option value="url_param_equals">URL Parameter Equals</option>
          </select>
        </div>
      </div>

      {/* Rule Value field */}
      <div>
        <label htmlFor="rule_value" className="block text-sm font-medium text-gray-700">
          {formData.rule_type === 'referrer_contains' ? 'Referrer Contains' : 'URL Contains'}
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="rule_value"
            id="rule_value"
            value={formData.rule_value}
            onChange={handleInputChange}
            className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
              hasError('rule_value') ? 'border-red-300' : ''
            }`}
            placeholder={
              formData.rule_type === 'referrer_contains'
                ? 'e.g., facebook.com'
                : 'e.g., utm_source'
            }
            aria-label="Rule value"
            tabIndex={0}
          />
          {hasError('rule_value') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('rule_value')}</p>
          )}
        </div>
      </div>

      {/* URL Parameter fields (only shown for url_param_equals rule type) */}
      {formData.rule_type === 'url_param_equals' && (
        <>
          <div>
            <label htmlFor="param_name" className="block text-sm font-medium text-gray-700">
              Parameter Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="param_name"
                id="param_name"
                value={formData.param_name}
                onChange={handleInputChange}
                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  hasError('param_name') ? 'border-red-300' : ''
                }`}
                placeholder="e.g., source"
                aria-label="Parameter name"
                tabIndex={0}
              />
              {hasError('param_name') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('param_name')}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="param_value" className="block text-sm font-medium text-gray-700">
              Parameter Value
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="param_value"
                id="param_value"
                value={formData.param_value}
                onChange={handleInputChange}
                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  hasError('param_value') ? 'border-red-300' : ''
                }`}
                placeholder="e.g., facebook"
                aria-label="Parameter value"
                tabIndex={0}
              />
              {hasError('param_value') && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage('param_value')}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Priority field */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority (lower numbers run first)
        </label>
        <div className="mt-1 max-w-xs">
          <input
            type="number"
            name="priority"
            id="priority"
            min={1}
            value={formData.priority}
            onChange={handleInputChange}
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            aria-label="Priority"
            tabIndex={0}
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center">
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={formData.active}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          aria-label="Active"
          tabIndex={0}
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Active (unchecking will disable this source)
        </label>
      </div>

      {/* Replacements section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Content Replacements</h3>
          <button
            type="button"
            onClick={handleAddReplacement}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            aria-label="Add replacement"
            tabIndex={0}
          >
            Add Replacement
          </button>
        </div>

        {formData.replacements.map((replacement, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-bold text-gray-700">Replacement #{index + 1}</h4>
              {formData.replacements.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveReplacement(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                  aria-label={`Remove replacement ${index + 1}`}
                  tabIndex={0}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor={`selector-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                CSS Selector
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id={`selector-${index}`}
                  value={replacement.selector}
                  onChange={(e) => handleReplacementSelectorChange(index, e.target.value)}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    hasError(`replacements[${index}].selector`) ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., #header, .hero-text, [data-unusual='title']"
                  aria-label={`Replacement ${index + 1} selector`}
                  tabIndex={0}
                />
                {hasError(`replacements[${index}].selector`) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getErrorMessage(`replacements[${index}].selector`)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor={`content-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Replacement Content
              </label>
              <div className="mt-1">
                <textarea
                  id={`content-${index}`}
                  value={replacement.content}
                  onChange={(e) => handleReplacementContentChange(index, e.target.value)}
                  rows={3}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    hasError(`replacements[${index}].content`) ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter the content that should replace the selected element"
                  aria-label={`Replacement ${index + 1} content`}
                  tabIndex={0}
                />
                {hasError(`replacements[${index}].content`) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getErrorMessage(`replacements[${index}].content`)}
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                You can use HTML tags for formatting (e.g., &lt;strong&gt;, &lt;a href=""&gt;)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            aria-label="Save source"
            tabIndex={0}
          >
            {isSubmitting ? 'Saving...' : 'Save Source'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SourceForm; 