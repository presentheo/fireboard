

import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

// Import hooks
import {useEffect, useState} from 'react'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"; 

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const db = getFirestore();

export default function Home() {

  let commentListArray = [];


  const [commentList, setCommentList] = useState([]);
  const [commentContent, setCommentContent] = useState("");

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

  useEffect(() => {
    getCommentList()
  }, [])

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
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="container">

          <header>
            <button>로그인</button>
            <button>회원가입</button>
          </header>

          <div className="main-wrapper">
            <div className="main-image-wrapper">
              <img src="https://blog.kakaocdn.net/dn/PPTU5/btqQfL0H1rI/aYLkahJpk3GUcVAOU1iOoK/img.jpg" alt=""/>
            </div>
            <div>
              <h1>천하제일 댓글대회!</h1>
              <p>위 사진에 가장 어울리는 댓글을 달아주세요.</p>
            </div>
          </div>

          <div className="comment-input-wrapper">
            <textarea value={commentContent} onChange={(e) => {handleChange(e)}} name="" id="commentInput" cols="30" rows="10"></textarea>
            <button onClick={() => {postComment()}}>댓글 남기기</button>
          </div>

          <div className="comment-list-wrapper" id="commentListEl">
            {commentList.map((comment) => {

              let date = comment.timestamp.toDate();

              if (!comment.isRemoved) {
                return (
                  <div className="comment">
                    <div>
                      <p>{comment.content}</p>
                    </div>
                    <div>
                      <button>👍{comment.like}</button>
                      <button>👎{comment.dislike}</button>
                    </div>
                    <div>
                      <span>{`${date.getMonth()}월 ${date.getDate()}일 ${date.getHours()}시 ${date.getMinutes()}분` }</span>
                    </div>
                  </div>
                )
              }

            })}

          </div>

        </div>

      </main>


    </div>
  )
}
