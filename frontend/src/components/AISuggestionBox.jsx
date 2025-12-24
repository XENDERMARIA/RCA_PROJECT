import { Sparkles, X, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const AISuggestionBox = ({ suggestion, onClose, onApply }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (!suggestion) return null;

  return (
    <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 ai-suggestion-box">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">AI Suggestion</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Copy suggestion"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {suggestion}
      </div>
      <p className="text-xs text-gray-500 mt-3 italic">
        💡 This is an AI suggestion. Review and modify as needed before using.
      </p>
    </div>
  );
};

export default AISuggestionBox;
