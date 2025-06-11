import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Clock, Star, Users, ChefHat } from 'lucide-react';
// import client from './mqttClient';
import { enviarPedido, escucharEstado } from './mqttClient';
import EstadoPedido from './components/EstadoPedido'; // al principio del archivo


const MenuInteractivo = () => {
    console.log("Menu interactivo cargado");
  const [carrito, setCarrito] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('hamburguesas');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [estadoPedido, setEstadoPedido] = useState(null);

  const categorias = [
    { id: 'hamburguesas', nombre: 'Hamburguesas', icono: '🍔' },
    { id: 'bebidas', nombre: 'Bebidas', icono: '🥤' },
    { id: 'acompañamientos', nombre: 'Acompañamientos', icono: '🍟' },
    { id: 'postres', nombre: 'Postres', icono: '🍰' },
    { id: 'desayunos', nombre: 'Desayunos', icono: '🥞' }
  ];

  const productos = {
    hamburguesas: [
      { id: 1, nombre: 'Big Mac', precio: 180.00, imagen: '🍔', descripcion: 'Doble carne, lechuga, queso, pepinillos', tiempo: '5-7 min', rating: 4.8 },
      { id: 2, nombre: 'Quarter Pounder', precio: 165.00, imagen: '🍔', descripcion: 'Carne de res, queso, cebolla, pepinillos', tiempo: '6-8 min', rating: 4.7 },
      { id: 3, nombre: 'McChicken', precio: 95.00, imagen: '🍗', descripcion: 'Pollo empanizado, lechuga, mayonesa', tiempo: '4-6 min', rating: 4.5 },
      { id: 4, nombre: 'Filet-O-Fish', precio: 110.00, imagen: '🐟', descripcion: 'Pescado empanizado, queso, salsa tártara', tiempo: '5-7 min', rating: 4.3 }
    ],
    bebidas: [
      { id: 5, nombre: 'Coca-Cola', precio: 35.00, imagen: '🥤', descripcion: 'Bebida gaseosa clásica - Grande', tiempo: '1 min', rating: 4.9 },
      { id: 6, nombre: 'Sprite', precio: 35.00, imagen: '🥤', descripcion: 'Bebida de lima-limón - Grande', tiempo: '1 min', rating: 4.6 },
      { id: 7, nombre: 'Café McCafé', precio: 45.00, imagen: '☕', descripcion: 'Café premium recién preparado', tiempo: '2-3 min', rating: 4.4 },
      { id: 8, nombre: 'Malteada', precio: 65.00, imagen: '🥤', descripcion: 'Malteada de vainilla cremosa', tiempo: '3-4 min', rating: 4.7 }
    ],
    acompañamientos: [
      { id: 9, nombre: 'Papas Fritas', precio: 45.00, imagen: '🍟', descripcion: 'Papas doradas y crujientes - Grande', tiempo: '3-4 min', rating: 4.8 },
      { id: 10, nombre: 'McNuggets 6 pzs', precio: 85.00, imagen: '🍗', descripcion: 'Nuggets de pollo premium', tiempo: '4-5 min', rating: 4.6 },
      { id: 11, nombre: 'Aros de Cebolla', precio: 55.00, imagen: '🧅', descripcion: 'Aros de cebolla dorados', tiempo: '3-4 min', rating: 4.3 },
      { id: 12, nombre: 'Ensalada César', precio: 75.00, imagen: '🥗', descripcion: 'Lechuga, crutones, aderezo césar', tiempo: '2-3 min', rating: 4.2 }
    ],
    postres: [
      { id: 13, nombre: 'McFlurry Oreo', precio: 55.00, imagen: '🍦', descripcion: 'Helado con galletas Oreo', tiempo: '2-3 min', rating: 4.7 },
      { id: 14, nombre: 'Pay de Manzana', precio: 35.00, imagen: '🥧', descripcion: 'Pay de manzana caliente', tiempo: '1-2 min', rating: 4.5 },
      { id: 15, nombre: 'Sundae de Fresa', precio: 40.00, imagen: '🍓', descripcion: 'Helado con salsa de fresa', tiempo: '1-2 min', rating: 4.4 },
      { id: 16, nombre: 'Galletas', precio: 25.00, imagen: '🍪', descripcion: 'Galletas de chispas de chocolate', tiempo: '1 min', rating: 4.3 }
    ],
    desayunos: [
      { id: 17, nombre: 'McMuffin Huevo', precio: 65.00, imagen: '🥪', descripcion: 'Muffin inglés, huevo, queso, jamón', tiempo: '4-5 min', rating: 4.6 },
      { id: 18, nombre: 'Hotcakes', precio: 75.00, imagen: '🥞', descripcion: 'Hotcakes esponjosos con miel', tiempo: '5-6 min', rating: 4.8 },
      { id: 19, nombre: 'Hash Browns', precio: 35.00, imagen: '🥔', descripcion: 'Papas doradas en cuadritos', tiempo: '3-4 min', rating: 4.4 },
      { id: 20, nombre: 'Burrito Desayuno', precio: 85.00, imagen: '🌯', descripcion: 'Huevo, jamón, queso en tortilla', tiempo: '4-5 min', rating: 4.5 }
    ]
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto.id);
      if (existente) {
        return prev.map(item =>
          item.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad === 0) {
      setCarrito(prev => prev.filter(item => item.id !== id));
    } else {
      setCarrito(prev => 
        prev.map(item =>
          item.id === id ? { ...item, cantidad: nuevaCantidad } : item
        )
      );
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const confirmarOrden = () => {
    const pedido = {
      id: 'mesa1',
      estado: 'Recibido', // 👈 AÑADE ESTA LÍNEA
      productos: carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      }))
    };     
  
    setEstadoPedido(null); // Limpiar estado previo
    enviarPedido(pedido); // 📤 Enviar por MQTT
    setMostrarConfirmacion(true); // Mostrar confirmación
  
    escucharEstado((estado) => {
      if (estado?.estado) {
        console.log("📦 Estado recibido:", estado);
        setEstadoPedido(estado.estado);
      }
    });
  };  

  const nuevaOrden = () => {
    setCarrito([]);
    setMostrarCarrito(false);
    setMostrarConfirmacion(false);
    setEstadoPedido(null); // 🧽 Limpiar estado al iniciar nueva orden
  };  

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fef3c7 100%)',
      fontFamily: 'Arial, sans-serif'
    },
    mainContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '16px'
    },
    header: {
      background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      marginBottom: '24px',
      padding: '24px'
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px'
    },
    headerSubtitle: {
      color: '#fecaca'
    },
    cartButton: {
      backgroundColor: 'white',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '16px',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      transition: 'all 0.3s ease'
    },
    cartBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#fbbf24',
      color: 'black',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px'
    },
    '@media (min-width: 1024px)': {
      gridContainer: {
        gridTemplateColumns: '1fr 2fr'
      }
    },
    categoriesPanel: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '24px',
      position: 'sticky',
      top: '16px'
    },
    categoriesTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#374151'
    },
    categoryButton: {
      width: '100%',
      textAlign: 'left',
      padding: '16px',
      borderRadius: '16px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px',
      transition: 'all 0.3s ease',
      fontSize: '16px',
      fontWeight: '500'
    },
    categoryButtonActive: {
      background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transform: 'scale(1.05)'
    },
    categoryButtonInactive: {
      backgroundColor: '#f9fafb',
      color: '#374151'
    },
    productsPanel: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '24px'
    },
    productsTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '24px',
      color: '#374151',
      textTransform: 'capitalize'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px'
    },
    '@media (min-width: 768px)': {
      productsGrid: {
        gridTemplateColumns: 'repeat(2, 1fr)'
      }
    },
    productCard: {
      background: 'linear-gradient(135deg, #f9fafb 0%, white 100%)',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    productHeader: {
      textAlign: 'center',
      marginBottom: '12px'
    },
    productEmoji: {
      fontSize: '48px',
      marginBottom: '8px'
    },
    productName: {
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#374151'
    },
    productDescription: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '12px',
      textAlign: 'center'
    },
    productInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      marginBottom: '12px',
      fontSize: '12px',
      color: '#6b7280'
    },
    productInfoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    productFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    productPrice: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#dc2626'
    },
    addButton: {
      background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      padding: '8px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      maxWidth: '400px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalHeader: {
      background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
      padding: '24px',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px'
    },
    modalHeaderContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white'
    },
    closeButton: {
      color: 'white',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '12px',
      fontSize: '20px',
      transition: 'background-color 0.3s ease'
    },
    modalBody: {
      padding: '24px'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '32px 0'
    },
    emptyCartIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    emptyCartText: {
      color: '#6b7280'
    },
    cartItem: {
      backgroundColor: '#f9fafb',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '16px'
    },
    cartItemHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    cartItemInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    cartItemEmoji: {
      fontSize: '24px'
    },
    cartItemName: {
      fontWeight: 'bold',
      color: '#374151'  // Agregado: gris oscuro para contraste
    },
    cartItemPrice: {
      color: '#dc2626',
      fontWeight: '600'
    },
    cartItemControls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    quantityButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '4px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    quantityText: {
      fontWeight: 'bold',
      fontSize: '18px'
    },
    itemTotal: {
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#dc2626'
    },
    totalSection: {
      borderTop: '2px solid #e5e7eb',
      paddingTop: '16px',
      marginBottom: '24px'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    totalAmount: {
      color: '#dc2626'
    },
    confirmButton: {
      width: '100%',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      color: 'white',
      fontWeight: 'bold',
      padding: '16px',
      borderRadius: '16px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.3s ease'
    },
    confirmationContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fef3c7 100%)',
      padding: '16px'
    },
    confirmationCard: {
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden'
    },
    confirmationHeader: {
      background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
      padding: '32px',
      textAlign: 'center'
    },
    confirmationIcon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    confirmationTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px'
    },
    confirmationSubtitle: {
      color: '#fecaca'
    },
    confirmationBody: {
      padding: '24px'
    },
    orderSummary: {
      backgroundColor: '#f9fafb',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '24px'
    },
    orderSummaryTitle: {
      fontWeight: 'bold',
      fontSize: '18px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#374151' // Agregado: gris oscuro para encabezado visible
    },    
    orderItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #e5e7eb'
    },
    orderItemInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    orderItemDetails: {
      display: 'flex',
      flexDirection: 'column'
    },
    orderItemName: {
      fontWeight: '500',
      color: '#374151' // Agregado: texto de nombre visible en confirmación
    },    
    orderItemQuantity: {
      fontSize: '14px',
      color: '#6b7280'
    },
    orderItemPrice: {
      fontWeight: 'bold',
      color: '#dc2626'
    },
    orderTotal: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '2px solid #fecaca'
    },
    orderTotalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#374151' // 🔧 Añadido: texto visible (gris oscuro)
    },    
    orderTotalAmount: {
      color: '#dc2626'
    },
    timeEstimate: {
      backgroundColor: '#eff6ff',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '24px'
    },
    timeEstimateHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    timeEstimateTitle: {
      fontWeight: 'bold',
      color: '#374151' // 🔧 Añadido: mejor contraste
    },    
    timeEstimateText: {
      fontSize: '14px',
      color: '#6b7280'
    },
    newOrderButton: {
      width: '100%',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      color: 'white',
      fontWeight: 'bold',
      padding: '16px',
      borderRadius: '16px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.3s ease'
    }
  };

  if (mostrarConfirmacion) {
    return (
      <div style={styles.confirmationContainer}>
        <div style={styles.confirmationCard}>
          <div style={styles.confirmationHeader}>
            <div style={styles.confirmationIcon}>✅</div>
            <h1 style={styles.confirmationTitle}>¡Orden Confirmada!</h1>
            <p style={styles.confirmationSubtitle}>Tu pedido está siendo preparado</p>
          </div>
          
          <div style={styles.confirmationBody}>
            <div style={styles.orderSummary}>
              <h3 style={styles.orderSummaryTitle}>
                <ChefHat color="#ef4444" size={20} />
                Resumen de tu orden
              </h3>

              {carrito.map((item, index) => (
                <div key={item.id} style={{
                  ...styles.orderItem,
                  ...(index === carrito.length - 1 ? {borderBottom: 'none'} : {})
                }}>
                  <div style={styles.orderItemInfo}>
                    <span style={{fontSize: '24px'}}>{item.imagen}</span>
                    <div style={styles.orderItemDetails}>
                      <p style={styles.orderItemName}>{item.nombre}</p>
                      <p style={styles.orderItemQuantity}>Cantidad: {item.cantidad}</p>
                    </div>
                  </div>
                  <p style={styles.orderItemPrice}>${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              ))}
              
              <div style={styles.orderTotal}>
                <div style={styles.orderTotalRow}>
                  <span>Total a pagar:</span>
                  <span style={styles.orderTotalAmount}>${calcularTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={styles.timeEstimate}>
              <div style={styles.timeEstimateHeader}>
                <Clock color="#3b82f6" size={20} />
                <span style={styles.timeEstimateTitle}>Tiempo estimado: 8-12 minutos</span>
              </div>

              {estadoPedido && (
                <EstadoPedido estado={estadoPedido} />
              )}
            </div>

            <button
              onClick={nuevaOrden}
              className="boton-confirmar"
              disabled={estadoPedido !== 'Entregado'}
              style={{
                opacity: estadoPedido === 'Entregado' ? 1 : 0.5,
                cursor: estadoPedido === 'Entregado' ? 'pointer' : 'not-allowed'
              }}
            >
              Nueva Orden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.headerTitle}>🍔 MenuMax</h1>
              <p style={styles.headerSubtitle}>Ordena fácil, come delicioso</p>
            </div>
            <button
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
              style={styles.cartButton}
              onMouseOver={(e) => e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}
              onMouseOut={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
            >
              <ShoppingCart size={24} />
              {carrito.length > 0 && (
                <span style={styles.cartBadge}>
                  {carrito.reduce((total, item) => total + item.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={window.innerWidth >= 1024 ? {
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '24px'
        } : {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }}>
          {/* Panel de Categorías */}
          <div>
            <div style={styles.categoriesPanel}>
              <h2 style={styles.categoriesTitle}>Categorías</h2>
              <div>
                {categorias.map(categoria => (
                  <button
                    key={categoria.id}
                    onClick={() => setCategoriaActiva(categoria.id)}
                    style={{
                      ...styles.categoryButton,
                      ...(categoriaActiva === categoria.id ? styles.categoryButtonActive : styles.categoryButtonInactive)
                    }}
                    onMouseOver={(e) => {
                      if (categoriaActiva !== categoria.id) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (categoriaActiva !== categoria.id) {
                        e.target.style.backgroundColor = '#f9fafb';
                      }
                    }}
                  >
                    <span style={{fontSize: '24px'}}>{categoria.icono}</span>
                    <span>{categoria.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de Productos */}
          <div>
            <div style={styles.productsPanel}>
              <h2 style={styles.productsTitle}>
                {categorias.find(c => c.id === categoriaActiva)?.nombre}
              </h2>
              <div style={window.innerWidth >= 768 ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              } : {
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '16px'
              }}>
                {productos[categoriaActiva]?.map(producto => (
                  <div 
                    key={producto.id} 
                    style={styles.productCard}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={styles.productHeader}>
                      <div style={styles.productEmoji}>{producto.imagen}</div>
                      <h3 style={styles.productName}>{producto.nombre}</h3>
                    </div>
                    
                    <p style={styles.productDescription}>{producto.descripcion}</p>
                    
                    <div style={styles.productInfo}>
                      <div style={styles.productInfoItem}>
                        <Clock size={12} />
                        <span>{producto.tiempo}</span>
                      </div>
                      <div style={styles.productInfoItem}>
                        <Star size={12} color="#fbbf24" />
                        <span>{producto.rating}</span>
                      </div>
                    </div>
                    
                    <div style={styles.productFooter}>
                      <span style={styles.productPrice}>
                        ${producto.precio.toFixed(2)}
                      </span>
                      <button
                        onClick={() => agregarAlCarrito(producto)}
                        style={styles.addButton}
                        onMouseOver={(e) => {
                          e.target.style.background = 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Carrito Modal */}
        {mostrarCarrito && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div style={styles.modalHeaderContent}>
                  <h2 style={styles.modalTitle}>Tu Orden</h2>
                  <button
                    onClick={() => setMostrarCarrito(false)}
                    style={styles.closeButton}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div style={styles.modalBody}>
                {carrito.length === 0 ? (
                  <div style={styles.emptyCart}>
                    <div style={styles.emptyCartIcon}>🛒</div>
                    <p style={styles.emptyCartText}>Tu carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    <div style={{marginBottom: '24px'}}>
                      {carrito.map(item => (
                        <div key={item.id} style={styles.cartItem}>
                          <div style={styles.cartItemHeader}>
                            <div style={styles.cartItemInfo}>
                              <span style={styles.cartItemEmoji}>{item.imagen}</span>
                              <div>
                                <h4 style={styles.cartItemName}>{item.nombre}</h4>
                                <p style={styles.cartItemPrice}>${item.precio.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                          <div style={styles.cartItemControls}>
                            <div style={styles.quantityControls}>
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                style={styles.quantityButton}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                              >
                                <Minus size={16} />
                              </button>
                              <span style={styles.quantityText}>{item.cantidad}</span>
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                style={styles.quantityButton}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <span style={styles.itemTotal}>
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={styles.totalSection}>
                      <div style={styles.totalRow}>
                        <span>Total:</span>
                        <span style={styles.totalAmount}>${calcularTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={confirmarOrden}
                      style={styles.confirmButton}
                      onMouseOver={(e) => {
                        e.target.style.background = 'linear-gradient(90deg, #059669 0%, #047857 100%)';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      Confirmar Orden
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuInteractivo;