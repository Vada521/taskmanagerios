'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Вход
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      if (result?.error) {
        alert(result.error);
      }
    } else {
      // Регистрация
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (res.ok) {
          // После успешной регистрации выполняем вход
          await signIn('credentials', {
            email: formData.email,
            password: formData.password,
          });
        } else {
          const data = await res.json();
          alert(data.error);
        }
      } catch (error) {
        alert('Ошибка при регистрации');
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isLogin ? '🎮 Вход в игру' : '🎮 Создание персонажа'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="game-input w-full"
            placeholder="Имя героя..."
            required
          />
        )}
        
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="game-input w-full"
          placeholder="Email..."
          required
        />
        
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="game-input w-full"
          placeholder="Пароль..."
          required
        />
        
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 game-button text-white font-medium"
        >
          {isLogin ? 'Войти' : 'Создать аккаунт'}
        </button>
        
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full bg-transparent border border-white/20 hover:bg-white/10 game-button text-white"
        >
          {isLogin ? 'Создать нового героя' : 'У меня уже есть аккаунт'}
        </button>
      </form>
    </div>
  );
} 