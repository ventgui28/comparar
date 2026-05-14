# Spec: Granular Reset Selection

## Overview
Improve the "Total Reset" functionality by providing users with granular control over what data they want to clear. The feature will offer quick actions for common tasks and a detailed selection modal for custom scenarios.

## User Interface

### 1. Header Reset Button
- Replace the simple "Reset Total" button with a **Dropdown Button**.
- **Main Action**: Opens the "Custom Reset" modal.
- **Dropdown Options**:
  - **Limpar Carrinho**: Clears only the cart.
  - **Limpar Sessão**: Clears files and cart (as they are dependent).
  - **Limpar Tudo**: Current behavior (clears everything).
  - **Personalizado...**: Opens the custom selection modal.

### 2. Custom Reset Modal
A modal containing checkboxes for each data category:
- **Ficheiros Importados**:
  - Automatically selects and disables the "Carrinho" checkbox when checked.
- **Carrinho de Compras**
- **Favoritos**
- **Uniões (Aliases)**
- **Perfis de Mapeamento**

## Technical Architecture

### 1. Data Sources Mapping
- **Files**: `activeFiles` store in IndexedDB.
- **Cart**: `toner-cart` in LocalStorage.
- **Favorites**: `toner-favorites` in LocalStorage.
- **Aliases**: `aliases` store in IndexedDB.
- **Profiles**: `profiles` store in IndexedDB.

### 2. State Management
- Implementation of a `handleGranularReset(options)` function in `TonerContext` or `useAppActions`.
- This function must update both the database/localStorage and the React state (`setActiveFiles`, `setCart`, etc.) to ensure UI consistency without requiring a full page reload for partial resets.

### 3. Safety Features
- **Dependent Reset**: If "Files" are cleared, the "Cart" MUST be cleared to prevent orphan items with invalid prices.
- **Confirmation**: Even for quick actions, a brief confirmation (Toast with "Undo" or a simple confirmation message) should be considered, except for "Clear Everything" which remains destructive.

## Success Criteria
- User can clear only the cart without losing imported files.
- User can clear files and cart while keeping aliases and mapping profiles.
- UI updates immediately after a partial reset without page reload.
- Selecting "Files" in the custom modal forces the "Cart" selection.
