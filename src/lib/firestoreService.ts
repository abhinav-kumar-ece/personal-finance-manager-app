import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { Transaction, BudgetLimit, BankAccount, ChatMessage } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_ACCOUNTS } from '../data/initialData';

// Firestore collection path helper
// Per-user data separation: /users/{userId}/...
export async function loadUserTransactions(userId: string): Promise<Transaction[]> {
  const localKey = `pfm_user_${userId}_transactions`;
  
  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'transactions');
      const snap = await getDoc(docRef);
      if (snap.exists() && Array.isArray(snap.data()?.items) && snap.data().items.length > 0) {
        const items = snap.data().items as Transaction[];
        localStorage.setItem(localKey, JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.warn('Firestore loadUserTransactions fallback to local:', e);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem(localKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }

  // Initial seed for new user
  try {
    localStorage.setItem(localKey, JSON.stringify(INITIAL_TRANSACTIONS));
  } catch {}
  return INITIAL_TRANSACTIONS;
}

export async function saveUserTransactions(userId: string, transactions: Transaction[]): Promise<void> {
  const localKey = `pfm_user_${userId}_transactions`;
  localStorage.setItem(localKey, JSON.stringify(transactions));

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'transactions');
      await setDoc(docRef, { items: transactions, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('Firestore saveUserTransactions error:', e);
    }
  }
}

export async function loadUserBudgets(userId: string): Promise<BudgetLimit[]> {
  const localKey = `pfm_user_${userId}_budgets`;

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'budgets');
      const snap = await getDoc(docRef);
      if (snap.exists() && Array.isArray(snap.data()?.items) && snap.data().items.length > 0) {
        const items = snap.data().items as BudgetLimit[];
        localStorage.setItem(localKey, JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.warn('Firestore loadUserBudgets fallback to local:', e);
    }
  }

  try {
    const saved = localStorage.getItem(localKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }

  try {
    localStorage.setItem(localKey, JSON.stringify(INITIAL_BUDGETS));
  } catch {}
  return INITIAL_BUDGETS;
}

export async function saveUserBudgets(userId: string, budgets: BudgetLimit[]): Promise<void> {
  const localKey = `pfm_user_${userId}_budgets`;
  try {
    localStorage.setItem(localKey, JSON.stringify(budgets));
  } catch {}

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'budgets');
      await setDoc(docRef, { items: budgets, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('Firestore saveUserBudgets error:', e);
    }
  }
}

export async function loadUserAccounts(userId: string): Promise<BankAccount[]> {
  const localKey = `pfm_user_${userId}_accounts`;

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'accounts');
      const snap = await getDoc(docRef);
      if (snap.exists() && Array.isArray(snap.data()?.items) && snap.data().items.length > 0) {
        const items = snap.data().items as BankAccount[];
        localStorage.setItem(localKey, JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.warn('Firestore loadUserAccounts fallback to local:', e);
    }
  }

  try {
    const saved = localStorage.getItem(localKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }

  try {
    localStorage.setItem(localKey, JSON.stringify(INITIAL_ACCOUNTS));
  } catch {}
  return INITIAL_ACCOUNTS;
}

export async function saveUserAccounts(userId: string, accounts: BankAccount[]): Promise<void> {
  const localKey = `pfm_user_${userId}_accounts`;
  try {
    localStorage.setItem(localKey, JSON.stringify(accounts));
  } catch {}

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'accounts');
      await setDoc(docRef, { items: accounts, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('Firestore saveUserAccounts error:', e);
    }
  }
}

export async function loadUserChatHistory(userId: string): Promise<ChatMessage[]> {
  const localKey = `pfm_user_${userId}_chathistory`;

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'chatHistory');
      const snap = await getDoc(docRef);
      if (snap.exists() && Array.isArray(snap.data()?.messages)) {
        const msgs = snap.data().messages as ChatMessage[];
        localStorage.setItem(localKey, JSON.stringify(msgs));
        return msgs;
      }
    } catch (e) {
      console.warn('Firestore loadUserChatHistory fallback to local:', e);
    }
  }

  try {
    const saved = localStorage.getItem(localKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }

  const defaultWelcome: ChatMessage[] = [
    {
      id: 'msg_welcome',
      role: 'model',
      text: "Hello! I am your AI Financial Assistant powered by Gemini 3.8 Flash. Ask me anything about your connected accounts, monthly spending breakdown, budget caps, or recommendations on reducing recurring subscriptions.",
      timestamp: new Date().toISOString(),
    }
  ];
  return defaultWelcome;
}

export async function saveUserChatHistory(userId: string, messages: ChatMessage[]): Promise<void> {
  const localKey = `pfm_user_${userId}_chathistory`;
  localStorage.setItem(localKey, JSON.stringify(messages));

  if (db) {
    try {
      const docRef = doc(db, 'users', userId, 'userData', 'chatHistory');
      await setDoc(docRef, { messages, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('Firestore saveUserChatHistory error:', e);
    }
  }
}
