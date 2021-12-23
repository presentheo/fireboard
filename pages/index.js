// Import hooks
import {useEffect, useState} from 'react'
import Head from 'next/head'

// Import bootstrap components
import { Container, Row, Col, Modal, Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpbSyV_FuKf2Sqr1OrS-4_KDGb4f4U8C4",
  authDomain: "bbspractice-9d83e.firebaseapp.com",
  projectId: "bbspractice-9d83e",
  storageBucket: "bbspractice-9d83e.appspot.com",
  messagingSenderId: "674020855689",
  appId: "1:674020855689:web:43f61c88857d53c9655b58",
  measurementId: "G-26TK9J2J4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export default function Home() {
  
  let commentListArray = [];

  const [userData, setUserData] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  const [newUserId, setNewUserId] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserPassword, setCurrentUserPassword] = useState("");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const [commentList, setCommentList] = useState([]);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    getCommentList()
  }, [])

  useEffect(() => {
    handleLogin()
  }, [])

  // 로그인
  const login = async (email, password) => {
    try {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(userCredential.user)
          // setIsLogin(true)
          // setShowLoginModal(false)
        })
        .catch((error) => {
          console.log(error.code)

          switch (error.code) {
            case "auth/invalid-email":
              alert("등록되지 않은 이메일 주소입니다.")
              break;
            case "auth/wrong-password":
              alert("비밀번호를 확인해주세요.")
              break;
            default:
              alert(`예기치 못한 오류가 발생했습니다. Errorcode: ${error.code}`)
              break;
          }
        })
    } catch (error) {
      console.log(error)
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      signOut(auth)
    } catch(error) {
      console.log(error)
    }
  }

  // 회원가입
  const signup = async (email, password) => {
    try {
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        confirm("회원가입이 완료되었습니다!")
        setShowSignupModal(false)
      })
      .catch((error) => {
        console.log(error.code);
        switch (error.code) {
          case "auth/email-already-in-use":
            alert("중복된 이메일입니다.")
            break;
          case "auth/weak-password":
            alert("비밀번호를 6자리 이상 입력해주세요.")
            break;
          case "auth/invalid-email":
            alert("유효하지 않은 이메일 주소입니다.")
            break;
          default:
            alert(`예기치 못한 오류가 발생했습니다. Errorcode: ${error.code}`)
            break;
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  // 로그인 상태 옵저버
  const handleLogin = async () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user)
        setUserData(user)
        setIsLogin(true)
        setShowLoginModal(false)
      } else {
        setUserData(null)
        setIsLogin(false)
      }
    })
  }

  // 댓글 DB 읽어오기
  const getCommentList = async () => {
    try {
      const snapshot = query(collection(db, "commentList"), orderBy("timestamp", "desc"))
      const q = await getDocs(snapshot); 
      q.forEach((e) => {
        commentListArray.push(e.data())
      })
      setCommentList(commentListArray)
      console.log(q)
    } catch(e) {
      console.log(e);
    }
  }

  // 댓글 DB에 전송
  const postComment = async () => {
    try{
      const docRef = await addDoc(collection(db, "commentList"), {
        content: commentContent,
        timestamp: new Date(),
        like: 0,
        dislike: 0,
        author: "",
        isRemoved: false
      });
      console.log("Document written!");
      getCommentList();
      setCommentContent("");
    } catch(error) {
      console.log(error)
    }
  }

  const handleChange = (event) => {
    setCommentContent(event.target.value)
  }

  return (
    <div>
      <Head>
        <title>🔥Fireboard!</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Container>

          <header>
            { isLogin && <Button variant="danger" onClick={() => logout()}>로그아웃</Button>}
            { !isLogin && <Button onClick={() => setShowLoginModal(true)}>로그인</Button>}
            { !isLogin && <Button onClick={() => setShowSignupModal(true)}>회원가입</Button>}
          </header>

          {/* 로그인 모달 */}
          <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} dialogClassName="modal-90w">
            <Modal.Header>
              <Modal.Title>로그인</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>아이디</Form.Label>
                  <Form.Control onChange={(e) => setCurrentUserId(e.target.value)} type="email"></Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control onChange={(e) => setCurrentUserPassword(e.target.value)} type="password"></Form.Control>
                </Form.Group>
                <Button onClick={() => login(currentUserId, currentUserPassword)}>로그인</Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* 회원가입 모달 */}
          <Modal show={showSignupModal} onHide={() => setShowSignupModal(false)} dialogClassName="modal-90w">
            <Modal.Header>
              <Modal.Title>회원가입</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>아이디</Form.Label>
                  <Form.Control onChange={(e) => setNewUserId(e.target.value)} type="email"></Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>비밀번호</Form.Label>
                  <Form.Control onChange={(e) => setNewUserPassword(e.target.value)} type="password"></Form.Control>
                </Form.Group>
                <Button onClick={() => signup(newUserId, newUserPassword)}>회원가입</Button>
              </Form>
            </Modal.Body>
          </Modal>

          <div className="main-wrapper">
            <div className="main-image-wrapper">
              <img src="/krrr.jpg" alt=""/>
            </div>
            <div>
              <h1>천하제일 댓글대회!</h1>
              <p>위 사진에 가장 어울리는 댓글을 달아주세요.</p>
            </div>
          </div>

          <div className="comment-input-wrapper">

            <InputGroup>
              <FormControl value={commentContent} onChange={(e) => {handleChange(e)}} id="commentInput"></FormControl>
              {
                isLogin ? 
                <Button onClick={() => {postComment()}}>댓글 남기기</Button> :
                <Button disabled onClick={() => {postComment()}}>댓글 남기기</Button>
              }
            </InputGroup>
          </div>

          <div className="comment-list-wrapper mt-5 mb-5" id="commentListEl">
            {commentList.map((comment, index) => {

              let date = comment.timestamp.toDate();

              if (!comment.isRemoved) {
                return (
                  <div className="comment" key={index}>
                    <Row border="primary">
                      <Col>
                        <p>{comment.content}</p>
                      </Col>
                      <Col>
                        <Button>👍{comment.like}</Button>
                        <Button>👎{comment.dislike}</Button>
                      </Col>
                      <Col>
                        <span>{`${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분` }</span>
                      </Col>
                    </Row>
                  </div>
                )
              }

            })}

          </div>

        </Container>

      </main>


    </div>
  )
}
