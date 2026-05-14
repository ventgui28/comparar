# Granular Reset Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o botão de reset total por uma funcionalidade de reset granular, incluindo um dropdown para ações rápidas e um modal para seleções personalizadas.

**Architecture:** Adicionar uma função `granularReset` ao `TonerContext` e um novo componente `ResetModal`. Atualizar o `App.jsx` para usar um botão dropdown para as ações de limpeza.

**Tech Stack:** React, Lucide-React, IndexedDB (idb), LocalStorage.

---

### Task 1: Atualizar Utilitário de Base de Dados para Limpeza Granular

**Files:**
- Modify: `toner-app/src/utils/db.js`

- [ ] **Step 1: Adicionar função `clearGranularData` ao `db.js`**

```javascript
export const clearGranularData = async (options) => {
  const db = await initDB();
  const storesToClear = [];
  if (options.files) storesToClear.push(ACTIVE_FILES_STORE);
  if (options.profiles) storesToClear.push(PROFILES_STORE);
  if (options.aliases) storesToClear.push(ALIASES_STORE);

  if (storesToClear.length === 0) return;

  const tx = db.transaction(storesToClear, 'readwrite');
  await Promise.all(storesToClear.map(store => tx.objectStore(store).clear()));
  await tx.done;
};
```

- [ ] **Step 2: Commit**

```bash
git add toner-app/src/utils/db.js
git commit -m "feat(db): adicionar utilitário para limpeza granular de dados"
```

---

### Task 2: Implementar Reset Granular no TonerContext

**Files:**
- Modify: `toner-app/src/context/TonerContext.jsx`

- [ ] **Step 1: Adicionar `granularReset` ao `TonerProvider`**

```javascript
  const granularReset = async (options) => {
    // 1. Limpar IndexedDB
    await clearGranularData(options);

    // 2. Limpar LocalStorage e atualizar estado do React
    if (options.files) {
      setActiveFiles([]);
      // Ficheiros implica reset do Carrinho
      options.cart = true;
    }
    
    if (options.cart) {
      setCart({});
      localStorage.removeItem('toner-cart');
    }

    if (options.favorites) {
      setFavorites([]);
      localStorage.removeItem('toner-favorites');
    }

    if (options.aliases) {
      setAliases([]);
    }

    // Perfis (profiles) não têm estado direto no TonerContext, são carregados sob pedido.
  };
```

- [ ] **Step 2: Atualizar o objeto `value` para incluir `granularReset`**

```javascript
  const value = { 
    // ... existentes
    granularReset
  };
```

- [ ] **Step 3: Commit**

```bash
git add toner-app/src/context/TonerContext.jsx
git commit -m "feat(context): implementar lógica de granularReset"
```

---

### Task 3: Criar Componente ResetModal

**Files:**
- Create: `toner-app/src/components/shared/ResetModal.jsx`

- [ ] **Step 1: Implementar UI e lógica do modal de reset personalizado**

```jsx
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ResetModal = ({ onConfirm, onClose }) => {
  const [options, setOptions] = useState({
    files: false,
    cart: false,
    favorites: false,
    aliases: false,
    profiles: false
  });

  const toggleOption = (key) => {
    setOptions(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'files' && next.files) {
        next.cart = true;
      }
      return next;
    });
  };

  const isFilesSelected = options.files;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in" style={{ maxWidth: '400px' }}>
        <button onClick={onClose} className="btn-close-modal"><X size={20} /></button>
        
        <div className="modal-header">
          <div className="header-text">
            <h2>Limpeza Personalizada</h2>
            <p className="subtitle">Seleciona o que desejas remover</p>
          </div>
        </div>

        <div className="modal-body">
          <div className="reset-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.files} onChange={() => toggleOption('files')} />
              <span>Ficheiros Importados (Limpa Carrinho)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', opacity: isFilesSelected ? 0.6 : 1 }}>
              <input 
                type="checkbox" 
                checked={options.cart} 
                onChange={() => toggleOption('cart')} 
                disabled={isFilesSelected}
              />
              <span>Carrinho de Compras</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.favorites} onChange={() => toggleOption('favorites')} />
              <span>Favoritos</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.aliases} onChange={() => toggleOption('aliases')} />
              <span>Uniões de Produtos (Aliases)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.profiles} onChange={() => toggleOption('profiles')} />
              <span>Perfis de Mapeamento</span>
            </label>
          </div>

          {(options.files || options.aliases || options.profiles) && (
            <div style={{ marginTop: '1.5rem', color: '#b91c1c', background: '#fef2f2', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span>Aviso: Algumas seleções são irreversíveis.</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button 
            disabled={!Object.values(options).some(v => v)} 
            onClick={() => onConfirm(options)} 
            className="btn-primary"
          >
            Limpar Selecionados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;
```

- [ ] **Step 2: Commit**

```bash
git add toner-app/src/components/shared/ResetModal.jsx
git commit -m "feat(ui): adicionar componente ResetModal"
```

---

### Task 4: Integrar Reset Granular no App.jsx

**Files:**
- Modify: `toner-app/src/App.jsx`
- Modify: `toner-app/src/App.css`

- [ ] **Step 1: Implementar Dropdown de Reset e integração com o modal**

```jsx
// Adicionar ao App.jsx
import { ChevronDown } from 'lucide-react';
import ResetModal from './components/shared/ResetModal';

// ... dentro do componente App
const { granularReset } = useToner();
const [showResetModal, setShowResetModal] = useState(false);
const [showResetDropdown, setShowResetDropdown] = useState(false);

const handleGranularConfirm = async (options) => {
  await granularReset(options);
  setShowResetModal(false);
  addToast("Limpeza concluída com sucesso.", "success");
};

// ... substituir o botão de reset antigo
<div className="reset-group" style={{ position: 'relative' }}>
  <button onClick={() => setShowResetModal(true)} className="btn-reset">
    Reset
  </button>
  <button 
    onClick={(e) => {
      e.stopPropagation();
      setShowResetDropdown(!showResetDropdown);
    }} 
    className="btn-reset-arrow"
  >
    <ChevronDown size={14} />
  </button>
  
  {showResetDropdown && (
    <div className="dropdown-menu animate-in">
      <button onClick={() => { granularReset({ cart: true }); setShowResetDropdown(false); }}>Limpar Carrinho</button>
      <button onClick={() => { granularReset({ files: true, cart: true }); setShowResetDropdown(false); }}>Limpar Sessão</button>
      <button onClick={() => { handleResetTotal(); setShowResetDropdown(false); }}>Reset Total</button>
      <button onClick={() => { setShowResetModal(true); setShowResetDropdown(false); }}>Personalizado...</button>
    </div>
  )}
</div>

{showResetModal && (
  <ResetModal 
    onConfirm={handleGranularConfirm}
    onClose={() => setShowResetModal(false)}
  />
)}
```

- [ ] **Step 2: Adicionar estilos CSS para o novo botão e dropdown**

```css
/* App.css */
.reset-group {
  display: flex;
  background: #fee2e2;
  border-radius: 8px;
  overflow: visible; /* Necessário para o dropdown */
}

.btn-reset-arrow {
  background: #fecaca;
  border: none;
  padding: 0 0.5rem;
  color: #b91c1c;
  cursor: pointer;
  border-left: 1px solid rgba(185, 28, 28, 0.1);
  display: flex;
  align-items: center;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  border-radius: 12px;
  padding: 0.5rem;
  z-index: 1000;
  min-width: 180px;
  border: 1px solid #f1f5f9;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  color: #475569;
}

.dropdown-menu button:hover {
  background: #f8fafc;
  color: var(--primary);
}
```

- [ ] **Step 3: Commit**

```bash
git add toner-app/src/App.jsx toner-app/src/App.css
git commit -m "feat(ui): integrar dropdown e modal de reset granular"
```

---

### Task 5: Verificação Final

- [ ] **Step 1: Testar ação rápida "Limpar Carrinho"**
- [ ] **Step 2: Testar ação rápida "Limpar Sessão" (verificar se limpa Ficheiros + Carrinho)**
- [ ] **Step 3: Testar Reset Personalizado com Ficheiros selecionados (verificar se Carrinho fica bloqueado)**
- [ ] **Step 4: Verificar se as Uniões (Aliases) são mantidas ao limpar apenas Ficheiros/Carrinho**
- [ ] **Step 5: Commit final**

```bash
git commit -m "test: verificar funcionalidade de reset granular"
```
