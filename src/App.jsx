import { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import axios from "axios";

const initializeProduct = {
  title: '',
  category: '',
  origin_price: 0,
  price: 0,
  unit: '',
  description: '',
  content: '',
  is_enabled: 0,
  imageUrl: '',
  imagesUrl: ['']
};

function App() {
  const { VITE_BASE_URL, VITE_API_PATH } = import.meta.env;
  const [account, setAccount] = useState({ username: '', password: '' });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(initializeProduct);

  // modal
  const editModal = useRef(null);
  const editModalRef = useRef(null);

  const handleForm = (e) => {
    const {name, value} = e.target;
    setAccount({
      ...account,
      [name]: value
    });
  }
  // 登入
  const login = async (e) => {
    try {
      e.preventDefault();
      const res = await axios.post(`${VITE_BASE_URL}/admin/signin`, account);
      alert(res.data.message);
      document.cookie = `ctoken=${res.data.token}; expires=${new Date(res.data.expired)}; path=/`;
      axios.defaults.headers.common['Authorization'] = res.data.token;
      setIsAuth(true);
      getProducts();
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  // 驗證是否登入
  useEffect(() => {
    (async() => {
      try {
        const token = document.cookie.replace(
          /(?:(?:^|.*;\s*)ctoken\s*\=\s*([^;]*).*$)|^.*$/,
          "$1",
        );
        axios.defaults.headers.common['Authorization'] = token;
        await axios.post(`${VITE_BASE_URL}/api/user/check`);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        setIsAuth(false);
      }
    })();
  }, []);

  // 登出
  const logout = async() => {
    try {
      await axios.post(`${VITE_BASE_URL}/logout`);
      setIsAuth(false);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  // 取得商品
  const getProducts = async () => {
    try {
      const res = await axios.get(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  // 新稱/編輯 Modal
  useEffect(() => {
    if (!isAuth) return;
    editModal.current = new Modal(editModalRef.current, { backdrop: 'static' });
  }, [isAuth]);

  const openModal = (prd) => {
    setTempProduct(prd ? { ...prd, is_enabled: prd.is_enabled === 1 ? true : false } : initializeProduct);
    editModal.current.show();
  };

  const closeModal = () => {
    editModal.current.hide();
  };

  const handleTempProduct = (e) => {
    const {name, value, checked, type} = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value
    })
  };

  const addImage = () => {
    const newImages = [...tempProduct.imagesUrl];
    newImages.push('');
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    });
  };

  const cancelImage = () => {
    const newImages = [...tempProduct.imagesUrl];
    newImages.pop();
    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    });
  };

  const handleImage = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    });
  };

  const editProduct = async () => {
    try {
      let apiMethod = 'post';
      let apieditUrl = `${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product`;
      if (tempProduct.id) {
        apiMethod = 'put';
        apieditUrl = `${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product/${tempProduct.id}`;
      }
      const prd = {...tempProduct};
      prd.origin_price = parseInt(prd.origin_price);
      prd.price = parseInt(prd.price);
      prd.is_enabled = prd.is_enabled ? 1 : 0;

      const res = await axios[apiMethod](apieditUrl, { data: prd });
      alert(res.data.message);
      closeModal();
      getProducts();
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  // 刪除商品
  const deleteProduct = async(prdId) => {
    try {
      const res = await axios.delete(`${VITE_BASE_URL}/api/${VITE_API_PATH}/admin/product/${prdId}`);
      alert(res.data.message);
      getProducts();
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  return (
    <>
    {
      !isAuth ? (
        <div className="container mt-5">
          <div className="row justify-content-center">
              <div className="col-6">
                <form onSubmit={login}>
                  <h3 className="text-center mb-3 fw-bold">請先登入</h3>
                  <div className="form-floating mb-3">
                    <input type="email" className="form-control" id="email" placeholder="請輸入電子郵件" value={account.username} name="username" onChange={handleForm} />
                    <label htmlFor="email">電子郵件</label>
                  </div>
                  <div className="form-floating mb-4">
                    <input type="password" className="form-control" id="password" placeholder="請輸入密碼"  value={account.password} name="password" onChange={handleForm} autoComplete="on" />
                    <label htmlFor="floatingPassword">密碼</label>
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn btn-primary px-4">登入</button>
                  </div>
                </form>
              </div>
          </div>
        </div>
      ) : (
        <div className="container mt-5">
            <div className="text-end mb-2">
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={logout}>登出</button>
              <button type="button" className="btn btn-primary btn-sm ms-1" onClick={() => openModal(null)}>新增商品</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>商品名稱</th>
                  <th>分類</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {
                  products.map((prd) => {
                    return (
                      <tr key={prd.id}>
                        <td>{prd.title}</td>
                        <td>{prd.category}</td>
                        <td>{prd.origin_price}</td>
                        <td>{prd.price}</td>
                        <td>{prd.is_enabled ? '啟用' : '未啟用'}</td>
                        <td>
                          <button type="button" className="btn btn-primary btn-sm me-1" onClick={() => openModal(prd)}>編輯</button>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => deleteProduct(prd.id)}>刪除</button>
                        </td>
                      </tr>
                    )
                  }) 
                }
              </tbody>
            </table>

            {/* 新增/編輯 Modal */}
            <div ref={editModalRef} className="modal fade">
              <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="modal-title fs-6 fw-bold" id="exampleModalLabel">{ tempProduct.id ? '編輯' : '新增' }商品</h2>
                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="title" className="form-label">商品名稱</label>
                          <input type="text" className="form-control" name="title" id="title" value={tempProduct.title} onChange={(e) => handleTempProduct(e)} />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="category" className="form-label">商品種類</label>
                          <input type="text" className="form-control" name="category" id="category" value={tempProduct.category} onChange={(e) => handleTempProduct(e)} />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="origin_price" className="form-label">原價</label>
                          <input type="number" className="form-control" name="origin_price" id="origin_price" value={tempProduct.origin_price} onChange={(e) => handleTempProduct(e)} />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="price" className="form-label">售價</label>
                          <input type="number" className="form-control" name="price" id="price" value={tempProduct.price} onChange={(e) => handleTempProduct(e)} />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="unit" className="form-label">單位</label>
                          <input type="text" className="form-control" id="unit" name="unit" value={tempProduct.unit} onChange={(e) => handleTempProduct(e)} />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="description" className="form-label">商品描述</label>
                          <input type="text" className="form-control" id="description" name="description" value={tempProduct.description} onChange={(e) => handleTempProduct(e)} />
                        </div>
                        <div className="col-12">
                          <label htmlFor="content" className="form-label">商品內容</label>
                          <textarea className="form-control" id="content" name="content" value={tempProduct.content} onChange={(e) => handleTempProduct(e)}></textarea>
                        </div>
                        <div className="col-12">
                          <div className="form-check">
                            <input className="form-check-input" checked={tempProduct.is_enabled} name="is_enabled" type="checkbox" defaultValue={0} id="is_enabled" onChange={(e) => handleTempProduct(e)} />
                            <label className="form-check-label" htmlFor="is_enabled">
                              是否啟用
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="imageUrl" className="form-label">商品主圖</label>
                          <input type="text" className="form-control mb-1" name="imageUrl" id="imageUrl" value={tempProduct.imageUrl} onChange={(e) => handleTempProduct(e)} />
                          <img src={tempProduct.imageUrl} className="img-fluid" alt={tempProduct.title} />
                        </div>
                        <div className="col-md-8">
                          <label htmlFor="imageUrl" className="form-label">商品圖片</label>
                          <div className="row">
                            {
                              tempProduct.imagesUrl?.map((img, index) => {
                                return (
                                  <div className="col-md-6 mb-2" key={index}>
                                    <input type="text" className="form-control mb-1" value={tempProduct.imagesUrl[index]} onChange={(e) => handleImage(e, index)} />
                                    <img src={img} className="img-fluid" alt={`${tempProduct.title}${index + 1}`} />
                                  </div>
                                )
                              })
                            }
                          </div>
                          <div className="btn-group w-100">
                            {
                              tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !== '' && (
                                <button className="btn btn-outline-primary btn-sm w-100" onClick={addImage}>新增圖片</button>
                              )
                            }
                            {
                              tempProduct.imagesUrl.length > 1 && (
                                <button className="btn btn-outline-danger btn-sm w-100" onClick={cancelImage}>取消圖片</button>
                              )
                            }
                          </div>
                        </div>
                      </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={closeModal}>取消</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={editProduct}>儲存</button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )
    }
      
    </>
  )
}

export default App
