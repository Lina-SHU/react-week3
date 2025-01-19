import { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
const apiUrl = 'https://ec-course-api.hexschool.io/v2';
const apiPath = 'react-lina';

function App() {
  const [account, setAccount] = useState({ username: '', password: '' });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);

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
  const login = async () => {
    try {
      const res = await axios.post(`${apiUrl}/admin/signin`, account);
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
        await axios.post(`${apiUrl}/api/user/check`);
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
      await axios.post(`${apiUrl}/logout`);
      setIsAuth(false);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  // 取得商品
  const getProducts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/${apiPath}/admin/products`);
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

  const openModal = () => {
    editModal.current.show();
  };

  const closeModal = () => {
    editModal.current.hide();
  }

  // 刪除商品
  const deleteProduct = async(prdId) => {
    try {
      const res = await axios.delete(`${apiUrl}/api/${apiPath}/admin/product/${prdId}`);
      alert(res.data.message);
      getProducts();
    } catch (error) {
      alert(error.response.data.message);
    }
  }
  return (
    <>
    {
      !isAuth ? (
        <div className="container mt-5">
          <div className="row justify-content-center">
              <div className="col-6">
                <form>
                  <h3 className="text-center mb-3 fw-bold">請先登入</h3>
                  <div className="form-floating mb-3">
                    <input type="email" className="form-control" id="email" placeholder="請輸入電子郵件" value={account.username} name="username" onChange={(e) => handleForm(e)} />
                    <label htmlFor="email">電子郵件</label>
                  </div>
                  <div className="form-floating mb-4">
                    <input type="password" className="form-control" id="password" placeholder="請輸入密碼"  value={account.password} name="password" onChange={(e) => handleForm(e)} autoComplete="on" />
                    <label htmlFor="floatingPassword">密碼</label>
                  </div>
                  <div className="text-center">
                    <button type="button" onClick={login} className="btn btn-primary px-4">登入</button>
                  </div>
                </form>
              </div>
          </div>
        </div>
      ) : (
        <div className="container mt-5">
            <div className="text-end mb-2">
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={logout}>登出</button>
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
                          <button type="button" className="btn btn-primary btn-sm me-1" onClick={openModal}>編輯</button>
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
                    <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    ...
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>取消</button>
                    <button type="button" className="btn btn-primary">儲存</button>
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
