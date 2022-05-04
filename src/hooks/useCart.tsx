import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  // const [stateStok, setStateStok] = useState<Stock>({} as Stock)

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId);

      const { data } = await api.get<Stock>(`/stock/${productId}`);

      const stockAmount = data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (productExists) {
        productExists.amount = amount;
      } else {
        const { data } = await api.get<Product>(`/products/${productId}`);

        const newProduct = {
          ...data,
          amount: 1,
        }
        updatedCart.push(newProduct);
      }
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      // const {data} = await api.get<Product>(`/products/${productId}`);
      // localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, { ...data, amount: 1 }]));
      // setCart(prevState => [...prevState, { ...data, amount: 1 }]);
      // toast.success('Produto adicionado com sucesso!');
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]
      const productExists = updatedCart.findIndex(product => product.id === productId);
      if (productExists >= 0) {
        updatedCart.splice(productExists, 1);
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      } else {
        throw Error()
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // let stock = stateStok
      // if(productId !== stock.id) await api.get(`/stock/${productId}`).then(({data}) => {
      //   stock = data;
      //   setStateStok(data);
      // })
      // const product = cart.findIndex(({ id }) => id === productId);
      // if(stock.amount < amount) {
      //   return toast.error('Quantidade solicitada fora de estoque!');
      // }
      // let newCart = cart
      // newCart[product].amount = amount;
      // localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      // setCart([...newCart.map(product => ({...product}))]);
      if (amount <= 0) {
        return;
      }
      
      const updatedCart = [...cart];
      const productSelected = updatedCart.find(product => product.id === productId);

      const { data } = await api.get<Stock>(`/stock/${productId}`);

      const stockAmount = data.amount;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if (productSelected) {
        productSelected.amount = amount;
        setCart(updatedCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
