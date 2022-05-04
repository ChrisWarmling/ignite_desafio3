import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';

// import { useCart } from '../../hooks/useCart';
// import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product: Product) => ({
    ...product,
    priceFormatted: formatPrice(product.price),
    subtotal: formatPrice(product.price * product.amount)
  }));
  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        return sumTotal + product.price * product.amount;
      }, 0)
    )

  function handleProductIncrement(productId: number) {
    const productInCart = cart.find(({ id }) => id === productId);
    if (!productInCart) return;
    updateProductAmount({
      productId,
      amount: productInCart.amount + 1
    })
  }

  function handleProductDecrement(productId: number) {
    const productInCart = cart.find(({ id }) => id === productId);
    if (!productInCart) return;
    updateProductAmount({
      productId,
      amount: productInCart.amount - 1
    })
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(({id, priceFormatted, amount, image, title, subtotal}) => (
            <tr key={id} data-testid="product">
            <td>
              <img src={image} alt={title} />
            </td>
            <td>
              <strong>{title}</strong>
              <span>{priceFormatted}</span>
            </td>
            <td>
              <div>
                <button
                  type="button"
                  data-testid="decrement-product"
                disabled={amount <= 1}
                onClick={() => handleProductDecrement(id)}
                >
                  <MdRemoveCircleOutline size={20} />
                </button>
                <input
                  type="text"
                  data-testid="product-amount"
                  readOnly
                  value={amount}
                />
                <button
                  type="button"
                  data-testid="increment-product"
                onClick={() => handleProductIncrement(id)}
                >
                  <MdAddCircleOutline size={20} />
                </button>
              </div>
            </td>
            <td>
              <strong>{subtotal}</strong>
            </td>
            <td>
              <button
                type="button"
                data-testid="remove-product"
              onClick={() => handleRemoveProduct(id)}
              >
                <MdDelete size={20} />
              </button>
            </td>
          </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
