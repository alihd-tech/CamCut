import React, { useState, useEffect, useRef } from 'react';
import { Type } from 'lucide-react';

interface TextEditorProps {
  onTextComplete: (text: string, style: TextStyle) => void;
  onBack: () => void;
}

export type TextStyle = 'comic' | 'neon' | 'retro';

interface StyleOption {
  id: TextStyle;
  name: string;
  description: string;
}

function TextEditor({ onTextComplete, onBack }: TextEditorProps) {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<TextStyle>('neon');
  const [placeholder, setPlaceholder] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const styles: StyleOption[] = [
    { id: 'comic', name: 'Comic', description: 'Bold & Fun' },
    { id: 'neon', name: 'Neon', description: 'Glowing Edge' },
    { id: 'retro', name: 'Retro', description: 'Vintage Vibe' },
  ];

  const templates = [
    'me , after entering DEFI',
    'me , when i saw solanam.com',
    'Me, when I got the bags',
    'Me, after selling my bags',
    'Me, when I got in early',
    'Me, before checking my portfolio',
    'Me, after buying the dip',
    'Me, when it finally pumps',
  ];

  // Animated placeholder effect
  useEffect(() => {
    const texts = ['me , after entering DEFI', 'me , when i saw solanam.com'];
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeText = () => {
      const currentText = texts[currentTextIndex];
      
      if (isDeleting) {
        setPlaceholder(currentText.substring(0, currentCharIndex - 1));
        currentCharIndex--;
        timeoutId = setTimeout(typeText, 50);
      } else {
        setPlaceholder(currentText.substring(0, currentCharIndex + 1));
        currentCharIndex++;
        timeoutId = setTimeout(typeText, 100);
      }

      if (!isDeleting && currentCharIndex === currentText.length) {
        timeoutId = setTimeout(() => {
          isDeleting = true;
          typeText();
        }, 2000);
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        timeoutId = setTimeout(typeText, 500);
      }
    };

    if (!text) {
      typeText();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text]);

  // Autocomplete suggestions
  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      const filtered = templates.filter(template =>
        template.toLowerCase().includes(value.toLowerCase()) &&
        template.toLowerCase() !== value.toLowerCase()
      );
      setSuggestions(filtered.slice(0, 3));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      onTextComplete(text.trim(), selectedStyle);
    }
  };

  const getPreviewStyle = () => {
    const baseClass = 'text-4xl font-black text-center leading-tight';
    switch (selectedStyle) {
      case 'comic':
        return `${baseClass} text-white` + ' [text-shadow:3px_3px_0px_rgba(0,0,0,1),6px_6px_0px_rgba(255,255,255,0.3)]';
      case 'neon':
        return `${baseClass} text-green-400` + ' [text-shadow:0_0_10px_rgba(34,197,94,1),0_0_20px_rgba(34,197,94,0.8),0_0_30px_rgba(34,197,94,0.6)]';
      case 'retro':
        return `${baseClass} text-yellow-300` + ' [text-shadow:2px_2px_0px_#FF00FF,4px_4px_0px_#00FFFF]';
      default:
        return baseClass;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-accent-main mb-2 flex items-center justify-center gap-3">
          <Type className="w-6 h-6 sm:w-8 sm:h-8 text-accent-main" />
          Add Text Overlay
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Write your text and choose a style that matches your video
        </p>
      </div>

      {/* Text Style Selector at Top */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Text Style
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`py-3 sm:py-4 px-2 sm:px-3 rounded-lg transition-all transform hover:scale-105 border text-center ${
                selectedStyle === style.id
                  ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-500/30'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <p className={`font-bold text-sm sm:text-base mb-0.5 ${
                selectedStyle === style.id ? 'text-white' : ''
              }`}>
                {style.name}
              </p>
              <p className={`text-xs ${
                selectedStyle === style.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Enter Your Text
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder || "Me, when..."}
            className="w-full h-28 sm:h-32 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-base sm:text-lg transition-all"
            maxLength={100}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {suggestions.map((suggestion: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm sm:text-base"
                >
                  <span className="font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Format: Me, [before/when/after], ...
            </span>
            <span className={`text-xs font-medium ${
              text.length > 90 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {text.length}/100
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Preview */}
      <div className="bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 rounded-xl p-6 sm:p-8 sm:min-h-48 border border-gray-800 shadow-xl flex items-center justify-center">
        <div className="w-full">
          {text ? (
            <>
              <div className="mb-4 text-center">
                <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-400 text-xs font-semibold rounded-full border border-primary-500/30">
                  {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style Preview
                </span>
              </div>
              <div className="bg-black/50 rounded-lg p-6 sm:p-8 backdrop-blur-sm">
                <p className={getPreviewStyle()}>
                  {text}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Type className="w-12 h-12 text-gray-600 dark:text-gray-700 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500 dark:text-gray-500 text-base sm:text-lg">
                Your text preview will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all font-semibold shadow-sm"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-primary-500/50 disabled:shadow-none"
        >
          Continue to Preview
        </button>
      </div>
    </div>
  );
}

export default TextEditor;
