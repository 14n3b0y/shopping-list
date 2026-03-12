import React, { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  AdaptivityProvider,
  AppRoot,
  Button,
  Cell,
  Checkbox,
  FormItem,
  Group,
  Header,
  IconButton,
  Input,
  Panel,
  PanelHeader,
  SplitCol,
  SplitLayout,
  View,
} from '@vkontakte/vkui';
import { Icon28DeleteOutline, Icon28EditOutline } from '@vkontakte/icons';
import '@vkontakte/vkui/dist/vkui.css';

interface Product {
  id: string;
  name: string;
  quantity?: string;
  note?: string;
  bought: boolean;
}

const STORAGE_KEY = 'shopping_list';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    bridge.send('VKWebAppInit').then(() => {
      bridge.send('VKWebAppGetUserInfo').then((data) => {
        setUser(data);
      });
    });
  }, []);

  useEffect(() => {
    bridge
      .send('VKWebAppStorageGet', { keys: [STORAGE_KEY] })
      .then((data) => {
        const stored = data.keys.find((k) => k.key === STORAGE_KEY);
        if (stored && stored.value) {
          setProducts(JSON.parse(stored.value));
        }
      })
      .catch(console.error);
  }, []);

  const saveToStorage = (newList: Product[]) => {
    bridge
      .send('VKWebAppStorageSet', {
        key: STORAGE_KEY,
        value: JSON.stringify(newList),
      })
      .catch(console.error);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      name: newName.trim(),
      quantity: newQuantity.trim(),
      note: newNote.trim(),
      bought: false,
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveToStorage(updated);
    setNewName('');
    setNewQuantity('');
    setNewNote('');
  };

  const toggleBought = (id: string) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, bought: !p.bought } : p
    );
    setProducts(updated);
    saveToStorage(updated);
  };

  const handleDelete = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveToStorage(updated);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setNewName(product.name);
    setNewQuantity(product.quantity || '');
    setNewNote(product.note || '');
  };

  const handleEditSave = () => {
    if (!editingId || !newName.trim()) return;
    const updated = products.map((p) =>
      p.id === editingId
        ? {
            ...p,
            name: newName.trim(),
            quantity: newQuantity.trim(),
            note: newNote.trim(),
          }
        : p
    );
    setProducts(updated);
    saveToStorage(updated);
    setEditingId(null);
    setNewName('');
    setNewQuantity('');
    setNewNote('');
  };

  return (
    <AdaptivityProvider>
      <AppRoot>
        <SplitLayout>
          <SplitCol>
            <View activePanel="main">
              <Panel id="main">
                <PanelHeader>Список покупок</PanelHeader>
                {user && (
                  <Group header={<Header>Привет, {user.first_name}!</Header>}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
                      {user.photo_100 && (
                        <img src={user.photo_100} alt="" style={{ borderRadius: '50%', marginRight: 8 }} />
                      )}
                      <span>Ваш список покупок</span>
                    </div>
                  </Group>
                )}

                <Group header={<Header>Добавить товар</Header>}>
                  <FormItem top="Название" required>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Молоко"
                    />
                  </FormItem>
                  <FormItem top="Количество">
                    <Input
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder="1 л"
                    />
                  </FormItem>
                  <FormItem top="Примечание">
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="безлактозное"
                    />
                  </FormItem>
                  <FormItem>
                    {editingId ? (
                      <Button size="l" stretched onClick={handleEditSave}>
                        Сохранить изменения
                      </Button>
                    ) : (
                      <Button size="l" stretched onClick={handleAdd}>
                        Добавить
                      </Button>
                    )}
                  </FormItem>
                </Group>

                <Group header={<Header>Мои покупки</Header>}>
                  {products.length === 0 ? (
                    <Cell>Список пуст. Добавьте товары!</Cell>
                  ) : (
                    products.map((product) => (
                      <Cell
                        key={product.id}
                        before={
                          <Checkbox
                            checked={product.bought}
                            onChange={() => toggleBought(product.id)}
                          />
                        }
                        after={
                          <>
                            <IconButton
                              label="Редактировать"
                              onClick={() => startEdit(product)}
                            >
                              <Icon28EditOutline />
                            </IconButton>
                            <IconButton
                              label="Удалить"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Icon28DeleteOutline />
                            </IconButton>
                          </>
                        }
                        subtitle={
                          (product.quantity || product.note) &&
                          `${product.quantity || ''} ${product.note || ''}`.trim()
                        }
                      >
                        {product.name}
                      </Cell>
                    ))
                  )}
                </Group>
              </Panel>
            </View>
          </SplitCol>
        </SplitLayout>
      </AppRoot>
    </AdaptivityProvider>
  );
};

export default App;