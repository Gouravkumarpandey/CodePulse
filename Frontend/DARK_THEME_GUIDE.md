# Dark Theme Implementation Guide

## Overview
CodePulse now supports both **Light** and **Dark** themes with a toggle option. The default theme is **Dark**, which uses a GitHub-inspired color palette.

## Features

### 🌓 Theme Toggle
- Users can switch between light and dark themes
- Theme preference is saved in `localStorage`
- Theme persists across page refreshes
- Default theme: Dark

### 🎨 Color System

#### Light Theme
- Background: White and light grays
- Text: Dark grays and blacks
- Accents: Indigo blue
- Borders: Light grays

#### Dark Theme (GitHub-inspired)
- Background: GitHub's dark backgrounds (#0d1117)
- Text: Light grays and whites
- Accents: GitHub blue (#1f6feb)
- Success: GitHub green (#2ea043)
- Warning: GitHub yellow (#d29922)
- Danger: GitHub red (#da3633)

## Implementation Details

### 1. Tailwind Configuration
The project uses Tailwind's class-based dark mode:

```javascript
// tailwind.config.js
darkMode: 'class'
```

### 2. Theme Context
Theme state is managed through a React Context:

```typescript
// src/context/ThemeContext.tsx
- ThemeProvider: Wraps the entire app
- useTheme(): Hook to access theme state and toggle function
```

### 3. Theme Toggle Component
A reusable component that displays a sun/moon icon:

```typescript
// src/components/common/ThemeToggle.tsx
- Shows Moon icon in light mode
- Shows Sun icon in dark mode
- Located in the Navbar
```

### 4. Global Styles
Enhanced CSS with dual-theme support:

```css
// src/index.css
- Base styles for both themes
- Dark mode background gradients
- Theme-aware scrollbar styles
- Utility classes for cards and buttons
```

## Usage

### Using the Theme Toggle
The theme toggle button is available in the navigation bar. Click it to switch between light and dark themes.

### Using Theme in Components

#### Standard Approach
Use Tailwind's `dark:` prefix for dark mode variants:

```tsx
<div className="bg-white dark:bg-github-canvas-subtle text-gray-900 dark:text-github-text">
  Content
</div>
```

#### Common Patterns

**Backgrounds:**
```tsx
bg-white dark:bg-github-canvas-subtle
bg-gray-50 dark:bg-github-bg
bg-gray-100 dark:bg-github-canvas-inset
```

**Text Colors:**
```tsx
text-gray-900 dark:text-github-text
text-gray-600 dark:text-github-text-secondary
text-blue-600 dark:text-github-accent
```

**Borders:**
```tsx
border-gray-200 dark:border-github-border
```

**Interactive Elements:**
```tsx
hover:bg-gray-100 dark:hover:bg-github-border-muted
```

### Accessing Theme Programmatically

```tsx
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
}
```

## GitHub Color Reference

The following GitHub colors are available in both themes:

| Color Name | CSS Variable | Usage |
|------------|--------------|-------|
| `github-bg` | #0d1117 | Main background |
| `github-canvas` | #010409 | Canvas background |
| `github-canvas-subtle` | #161b22 | Subtle canvas |
| `github-canvas-inset` | #010409 | Inset areas |
| `github-border` | #30363d | Primary borders |
| `github-border-muted` | #21262d | Muted borders |
| `github-text` | #e6edf3 | Primary text |
| `github-text-secondary` | #7d8590 | Secondary text |
| `github-text-link` | #58a6ff | Link text |
| `github-success` | #2ea043 | Success states |
| `github-warning` | #d29922 | Warning states |
| `github-danger` | #da3633 | Danger states |
| `github-accent` | #1f6feb | Accent/primary |
| `github-accent-emphasis` | #388bfd | Emphasized accent |

## Components Updated

All components have been updated with dark mode support:

### Layout Components
- ✅ Navbar (with ThemeToggle)
- ✅ Sidebar
- ✅ Footer

### Common Components
- ✅ Button
- ✅ Card
- ✅ Modal
- ✅ Badge
- ✅ Loader
- ✅ ThemeToggle (new)

### UI Components
- ✅ Button (ui)
- ✅ Card (ui)
- ✅ Modal (ui)
- ✅ StatusBadge

### Admin Components
- ✅ RulesForm
- ✅ UserDetail
- ✅ UsersTable

### User Components
- ✅ CommitTimeline
- ✅ RepoCard
- ✅ StatusBanner
- ✅ WarningList

### All Pages
- ✅ HomePage
- ✅ LoginPage
- ✅ SignupPage
- ✅ All Admin Pages
- ✅ All User Pages
- ✅ Callback Pages
- ✅ RepositorySelectionPage

## Best Practices

1. **Always provide dark mode variants** for color-based classes
2. **Test in both themes** before committing
3. **Use semantic colors** from the GitHub palette
4. **Maintain consistency** with existing patterns
5. **Consider accessibility** - ensure sufficient contrast in both themes

## Troubleshooting

### Theme not applying
- Check that `ThemeProvider` wraps your app in `App.tsx`
- Verify Tailwind config has `darkMode: 'class'`
- Ensure the `dark` class is on the `<html>` element

### Colors not matching
- Use the GitHub color palette defined in `tailwind.config.js`
- Follow the pattern: `light-color dark:dark-color`

### Theme not persisting
- Check browser's localStorage is enabled
- Verify the ThemeContext is saving to localStorage correctly

## Future Enhancements

Potential improvements:
- System preference detection (light/dark)
- Additional theme variants (high contrast, etc.)
- Theme customization options
- Animated theme transitions
