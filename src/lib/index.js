/* istanbul ignore file */

import {
  // eslint-disable-next-line max-len
  signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
} from 'firebase/auth';
import {
  addDoc, collection, getDocs, orderBy, query, updateDoc, deleteDoc, Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((result) => result)
    .catch((error) => {
      throw error;
    });
};

// Función que crea el usuario con correo y contraseña
// eslint-disable-next-line max-len
const createUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);

// Función que inicia sesión con email y password
const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

// Función para crear un post
const addPost = async (post) => {
  const name = auth.currentUser.displayName;
  const date = Timestamp.now();
  const postsCollection = collection(db, 'posts');
  await addDoc(postsCollection, {
    name,
    post,
    date,
    likes: [],
    likesCount: 0,
  });
};

const showPostsProfile = async () => {
  const querySnapshot = query(collection(db, 'posts'), orderBy('date', 'desc'));
  const postsSnapshot = await getDocs(querySnapshot);
  const getPostSection = document.getElementById('post-section');
  getPostSection.innerHTML = '';
  postsSnapshot.forEach((doc) => {
    const individualPost = document.createElement('article');
    individualPost.setAttribute('id', 'individual-post');
    individualPost.classList.add('individual-post');
    const post = doc.data();
    const divProfile = document.createElement('div');
    divProfile.classList.add('div-profile');
    const imgProfile = document.createElement('img');
    const postNameUser = document.createElement('h4');
    postNameUser.classList.add('user-name');
    const postContent = document.createElement('p');
    postContent.classList.add('user-post');
    const postDate = document.createElement('p');
    postDate.classList.add('date');
    postDate.textContent = post.date.toDate().toLocaleDateString();
    imgProfile.src = auth.currentUser.photoURL;
    imgProfile.style.borderRadius = '50%';
    imgProfile.style.height = '40px';
    imgProfile.style.width = '40px';
    postNameUser.textContent = post.name;
    postContent.textContent = post.post;
    const isCurrentUserPost = post.name === auth.currentUser.displayName;
    if (isCurrentUserPost) {
      const sectionLike = document.createElement('section');
      sectionLike.classList.add('section-like');
      const getReduceButton = document.querySelector('#reduceButton');
      const getIncreaseButton = document.querySelector('#increaseButton');
      const getNormalButton = document.querySelector('#normalButton');
      getReduceButton.addEventListener('click', () => {
        postContent.style.fontSize = '0.8rem';
        postNameUser.style.fontSize = '0.9rem';
      });
      getIncreaseButton.addEventListener('click', () => {
        postContent.style.fontSize = '1.1rem';
        postNameUser.style.fontSize = '1.2rem';
      });
      getNormalButton.addEventListener('click', () => {
        postContent.style.fontSize = '0.9rem';
        postNameUser.style.fontSize = '1rem';
      });
      // Sección botones editar y borrar
      const sectionButtons = document.createElement('section');
      sectionButtons.classList.add('section-buttons-post');
      const buttonEdit = document.createElement('button');
      buttonEdit.classList.add('button-edit');
      const editButton = document.createElement('img');
      editButton.classList.add('edit-button');
      editButton.src = '/images/editar.png';
      editButton.alt = 'Editar publicación';
      const deleteButton = document.createElement('img');
      const buttonDelete = document.createElement('button');
      buttonDelete.classList.add('button-delete');
      deleteButton.classList.add('delete-button');
      deleteButton.src = '/images/trash.png';
      deleteButton.alt = 'Eliminar publicación';
      individualPost.append(sectionButtons);
      sectionButtons.append(buttonEdit, buttonDelete);
      buttonEdit.append(editButton);
      buttonDelete.append(deleteButton);
      if (editButton) {
        editButton.addEventListener('click', () => {
          const popUp = document.createElement('dialog');
          popUp.setAttribute('id', 'popUp');
          popUp.classList.add('popUp-edit');
          const generalSection = document.getElementById('general-section');
          generalSection.appendChild(popUp);
          const line = document.createElement('section');
          line.classList.add('line');
          const editDescription = document.createElement('h4');
          editDescription.classList.add('edit-description');
          editDescription.textContent = 'Edita tu publicación';
          const textareaEdit = document.createElement('textarea');
          textareaEdit.classList.add('textarea-edit');
          textareaEdit.value = post.post;
          const saveButton = document.createElement('button');
          saveButton.classList.add('save-button');
          saveButton.textContent = 'Guardar';
          const closeIconSection = document.createElement('section');
          closeIconSection.classList.add('close-icon');
          const closeEdit = document.createElement('img');
          closeEdit.src = '/images/close-edit.png';
          closeEdit.alt = 'Cerrar pantalla de edición';
          closeEdit.classList.add('close-edit');
          const closeEditButton = document.createElement('button');
          closeEditButton.classList.add('closeedit-button');
          popUp.showModal();
          closeIconSection.append(closeEditButton);
          closeEditButton.append(closeEdit);
          popUp.append(closeIconSection, editDescription, line, textareaEdit, saveButton);
          saveButton.addEventListener('click', async () => {
            const editedPost = textareaEdit.value;
            await updateDoc(doc.ref, { post: editedPost });
            post.post = editedPost;
            postContent.textContent = editedPost;
            popUp.remove();
          });
          closeEditButton.addEventListener('click', () => {
            popUp.remove();
          });
        });
      }
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          const popUpDelete = document.createElement('dialog');
          popUpDelete.setAttribute('id', 'popUp-delete');
          popUpDelete.classList.add('popUp-delete');
          const generalSection = document.getElementById('general-section');
          generalSection.appendChild(popUpDelete);
          const editDescription = document.createElement('h4');
          editDescription.classList.add('delete-description');
          editDescription.textContent = '¿Estás seguro que quieres eliminar tu publicación?';
          const buttonSection = document.createElement('section');
          buttonSection.classList.add('button-section');
          const acceptButton = document.createElement('button');
          acceptButton.classList.add('accept-button');
          acceptButton.textContent = 'Eliminar';
          const cancelButton = document.createElement('button');
          cancelButton.classList.add('cancel-button');
          cancelButton.textContent = 'Cancelar';
          popUpDelete.showModal();
          popUpDelete.append(editDescription, buttonSection);
          buttonSection.append(acceptButton, cancelButton);
          acceptButton.addEventListener('click', async () => {
            try {
              await deleteDoc(doc.ref);
              individualPost.remove();
            } catch (error) {
              console.error('error deleting the post:', error);
            } finally {
              popUpDelete.remove();
            }
          });
          cancelButton.addEventListener('click', () => {
            popUpDelete.remove();
          });
        });
      }
      getPostSection.append(individualPost);
      divProfile.append(imgProfile, postNameUser);
      individualPost.append(divProfile, postContent, sectionLike);
      sectionLike.append(postDate);
    }
  });
};
// Función para mostrar todos los posts
const showPosts = async () => {
  const querySnapshot = query(collection(db, 'posts'), orderBy('date', 'desc'));
  const postsSnapshot = await getDocs(querySnapshot);
  const getPostSection = document.getElementById('post-section');
  getPostSection.innerHTML = '';
  postsSnapshot.forEach((doc) => {
    const individualPost = document.createElement('article');
    individualPost.setAttribute('id', 'individual-post');
    individualPost.classList.add('individual-post');
    const post = doc.data();
    const divProfile = document.createElement('div');
    divProfile.classList.add('div-profile');
    const imgProfile = document.createElement('img');
    const postNameUser = document.createElement('h4');
    postNameUser.classList.add('user-name');
    const postContent = document.createElement('p');
    postContent.classList.add('user-post');
    const postDate = document.createElement('p');
    postDate.classList.add('date');
    postDate.textContent = post.date.toDate().toLocaleDateString();
    const isCurrentUserPost = post.name === auth.currentUser.displayName;
    if (isCurrentUserPost) {
      imgProfile.src = auth.currentUser.photoURL;
    } else {
      imgProfile.src = '/images/azul.png';
    }
    imgProfile.style.borderRadius = '50%';
    imgProfile.style.height = '40px';
    imgProfile.style.width = '40px';

    postNameUser.textContent = post.name;
    postContent.textContent = post.post;
    const sectionLike = document.createElement('section');
    sectionLike.classList.add('section-like');
    const subSectionLike = document.createElement('section');
    subSectionLike.classList.add('subsection');
    const likeButton = document.createElement('button');
    likeButton.classList.add('like-button');
    const likeImage = document.createElement('img');
    likeImage.src = '/images/icono-brazo-like.png';
    likeImage.alt = 'Dar like a la publicación';
    likeImage.classList.add('likeImgFeed');
    let userLiked = post.likes && post.likes.includes(auth.currentUser.uid);
    const likesCount = document.createElement('p');
    likesCount.classList.add('counter');
    likesCount.textContent = post.likes.length;
    likeImage.src = userLiked ? '/images/button-liked.png' : '/images/icono-brazo-like.png';

    likeButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const userId = auth.currentUser.uid;
      const arrayLikes = post.likes;

      const tempArrayLikes = arrayLikes || [];
      userLiked = tempArrayLikes.includes(userId);

      try {
        if (userLiked === false) {
          likeImage.src = '/images/button-liked.png';
          tempArrayLikes.push(userId);
          const arrayLikesLength = tempArrayLikes.length;
          await updateDoc(doc.ref, { likes: tempArrayLikes });
          await updateDoc(doc.ref, { likesCount: arrayLikesLength });
          likesCount.textContent = arrayLikesLength.toString();
        }
        if (userLiked) {
          likeImage.src = '/images/icono-brazo-like.png';
          const indexUserLikesArray = tempArrayLikes.indexOf(userId);
          tempArrayLikes.splice(indexUserLikesArray, 1);
          const arrayLikesLength = tempArrayLikes.length;

          await updateDoc(doc.ref, { likes: tempArrayLikes });
          await updateDoc(doc.ref, { likesCount: arrayLikesLength });

          likesCount.textContent = arrayLikesLength.toString();
        }
      } catch (error) {
        console.error('Error updating the post:', error);
      }
    });
    // Botones de accesibilidad
    const getReduceButton = document.querySelector('#reduceButton');
    const getIncreaseButton = document.querySelector('#increaseButton');
    const getNormalButton = document.querySelector('#normalButton');
    getReduceButton.addEventListener('click', () => {
      postContent.style.fontSize = '0.8rem';
      postNameUser.style.fontSize = '0.9rem';
    });
    getIncreaseButton.addEventListener('click', () => {
      postContent.style.fontSize = '1.1rem';
      postNameUser.style.fontSize = '1.2rem';
    });
    getNormalButton.addEventListener('click', () => {
      postContent.style.fontSize = '0.9rem';
      postNameUser.style.fontSize = '1rem';
    });
    // Sección botones editar y borrar
    const isCurrentUser = post.name === auth.currentUser.displayName;
    if (isCurrentUser) {
      const sectionButtons = document.createElement('section');
      sectionButtons.classList.add('section-buttons-post');
      const buttonEdit = document.createElement('button');
      buttonEdit.classList.add('button-edit');
      const editButton = document.createElement('img');
      editButton.classList.add('edit-button');
      editButton.src = '/images/editar.png';
      editButton.alt = 'Editar publicación';
      const deleteButton = document.createElement('img');
      const buttonDelete = document.createElement('button');
      buttonDelete.classList.add('button-delete');
      deleteButton.classList.add('delete-button');
      deleteButton.src = '/images/trash.png';
      deleteButton.alt = 'Eliminar publicación';
      individualPost.append(sectionButtons);
      sectionButtons.append(buttonEdit, buttonDelete);
      buttonEdit.append(editButton);
      buttonDelete.append(deleteButton);
      if (editButton) {
        editButton.addEventListener('click', () => {
          const popUp = document.createElement('dialog');
          popUp.setAttribute('id', 'popUp');
          popUp.classList.add('popUp-edit');
          const generalSection = document.getElementById('general-section');
          generalSection.appendChild(popUp);
          const line = document.createElement('section');
          line.classList.add('line');
          const editDescription = document.createElement('h4');
          editDescription.classList.add('edit-description');
          editDescription.textContent = 'Edita tu publicación';
          const textareaEdit = document.createElement('textarea');
          textareaEdit.classList.add('textarea-edit');
          textareaEdit.value = post.post;
          const saveButton = document.createElement('button');
          saveButton.classList.add('save-button');
          saveButton.textContent = 'Guardar';
          const closeIconSection = document.createElement('section');
          closeIconSection.classList.add('close-icon');
          const closeEdit = document.createElement('img');
          closeEdit.src = '/images/close-edit.png';
          closeEdit.alt = 'Cerrar pantalla de edición';
          closeEdit.classList.add('close-edit');
          const closeEditButton = document.createElement('button');
          closeEditButton.classList.add('closeedit-button');
          popUp.showModal();
          closeIconSection.append(closeEditButton);
          closeEditButton.append(closeEdit);
          popUp.append(closeIconSection, editDescription, line, textareaEdit, saveButton);
          closeEditButton.addEventListener('click', () => {
            popUp.remove();
          });
          saveButton.addEventListener('click', async () => {
            const editedPost = textareaEdit.value;
            await updateDoc(doc.ref, { post: editedPost });
            post.post = editedPost;
            postContent.textContent = editedPost;
            popUp.remove();
          });
        });
      }
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          const popUpDelete = document.createElement('dialog');
          popUpDelete.setAttribute('id', 'popUp-delete');
          popUpDelete.classList.add('popUp-delete');
          const generalSection = document.getElementById('general-section');
          generalSection.appendChild(popUpDelete);
          const editDescription = document.createElement('h4');
          editDescription.classList.add('delete-description');
          editDescription.textContent = '¿Estás seguro que quieres eliminar tu publicación?';
          const buttonSection = document.createElement('section');
          buttonSection.classList.add('button-section');
          const acceptButton = document.createElement('button');
          acceptButton.classList.add('accept-button');
          acceptButton.textContent = 'Eliminar';
          const cancelButton = document.createElement('button');
          cancelButton.classList.add('cancel-button');
          cancelButton.textContent = 'Cancelar';
          popUpDelete.showModal();
          popUpDelete.append(editDescription, buttonSection);
          buttonSection.append(acceptButton, cancelButton);
          acceptButton.addEventListener('click', async () => {
            try {
              await deleteDoc(doc.ref);
              individualPost.remove();
            } catch (error) {
              console.error('error deleting the post:', error);
            } finally {
              popUpDelete.remove();
            }
          });
          cancelButton.addEventListener('click', () => {
            popUpDelete.remove();
          });
        });
      }
    }
    divProfile.append(imgProfile, postNameUser);
    individualPost.append(divProfile, postContent, postDate, sectionLike);
    getPostSection.append(individualPost);
    sectionLike.append(postDate, subSectionLike);
    subSectionLike.append(likeButton, likesCount);
    likeButton.append(likeImage);
    likeButton.append(likeImage);
  });
};
// acá llamamos a signOut que es de firebase y nos permite cerrar sesión, exportamos
// a feed.js para utilizarla con el boton
const logOut = async () => {
  await signOut(auth);
};

export {
  // eslint-disable-next-line max-len
  loginWithGoogle, createUser, signIn, addPost, showPosts, logOut, showPostsProfile,
};
