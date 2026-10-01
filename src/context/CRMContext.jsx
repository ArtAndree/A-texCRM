import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { currentUser, managers } from '../data/managers.js';
import { createInitialState, applyDealPatch, appendComment, createClient, createDeal, appendClientComment, completeTask } from '../utils/crm.js';
import { loadState, STORAGE_KEY } from '../utils/storage.js';
const CRMContext = createContext(null);
export function CRMProvider({
  children
}) {
  const [initial] = useState(() => {
    try {
      return loadState(window.localStorage);
    } catch {
      return {
        state: null,
        error: 'Хранилище браузера недоступно. Изменения сохраняются только до перезагрузки.'
      };
    }
  });
  const [state, setState] = useState(() => initial.state || createInitialState());
  const latest = useRef(state);
  const [storageError, setStorageError] = useState(initial.error);
  const [canSave, setCanSave] = useState(!initial.error);
  useEffect(() => {
    if (!canSave) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError('');
    } catch {
      setStorageError('Не удалось сохранить данные в браузере. Последние изменения могут потеряться после перезагрузки.');
    }
  }, [state, canSave]);
  function commit(next) {
    latest.current = next;
    setState(next);
  }
  function updateDeal(id, patch) {
    commit(applyDealPatch(latest.current, id, patch, currentUser.id, new Date().toISOString(), crypto.randomUUID()));
  }
  function addComment(id, text) {
    commit(appendComment(latest.current, id, text, currentUser.id, new Date().toISOString(), crypto.randomUUID()));
  }
  function addClient(input) {
    const id = crypto.randomUUID();
    commit(createClient(latest.current, input, currentUser.id, new Date().toISOString(), id));
    return id;
  }
  function addDeal(input) {
    const id = crypto.randomUUID();
    commit(createDeal(latest.current, input, currentUser.id, new Date().toISOString(), id));
    return id;
  }
  function addClientComment(id, text) {
    commit(appendClientComment(latest.current, id, text, currentUser.id, new Date().toISOString(), crypto.randomUUID()));
  }
  function finishTask(id) {
    commit(completeTask(latest.current, id, currentUser.id, new Date().toISOString(), crypto.randomUUID()));
  }
  function resetDemo() {
    commit(createInitialState());
    setCanSave(true);
  }
  return <CRMContext.Provider value={{
    ...state,
    managers,
    currentUser,
    updateDeal,
    addComment,
    addClient,
    addDeal,
    addClientComment,
    finishTask,
    resetDemo,
    storageError
  }}>{children}</CRMContext.Provider>;
}
export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error('CRMProvider отсутствует');
  return context;
}
