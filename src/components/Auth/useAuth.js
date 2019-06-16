import { useState, useEffect } from 'react'
import firebase from '../../firebase/'
import * as queryString from 'query-string'

function useAuth() {
  const [authUser, setAuthUser] = useState(null)

  useEffect(() => {
    const unsubscribe = firebase.auth.onAuthStateChanged(user => {
      if (firebase.auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn')
        const parsed = queryString.parse(window.location.search)
        console.log("PARSED:", parsed)
        console.log("EMAIL:", email)
  
        if (!email) {
          email = window.prompt('Please provide your email for confirmation.')
        }
        console.log("EMAIL 2:", email)
        const href = queryString.parse(window.location.href)
        console.log(href)

        firebase.auth
          .signInWithEmailLink(email, window.location.href)
          .then(function(result) {
            window.localStorage.removeItem('emailForSignIn')
            window.localStorage.setItem('user', JSON.stringify(user))
            firebase.firestore
              .collection(
                `users/${parsed.userId}/groups/${parsed.groupId}/members`
              )
              .doc(result.user.uid)
              .set({
                userId: result.user.uid,
                displayName: result.user.displayName,
                profilePicture: result.user.photoURL
              })

            var newMemberId = JSON.parse(localStorage.getItem("user")).uid
            firebase.firestore
              .collection(
                `users/${newMemberId}/guestGroups`
                )
              .doc(parsed.groupId)
              .set({
                groupId: parsed.groupId,
                groupName: parsed.groupName,
                groupAdmin: parsed.userId
              })
            console.log("newMemberId:", newMemberId)
            console.log("parsed.groupId:", parsed.groupId)
            console.log("parsed.userId:", parsed.userId)
          })
          .catch(function(err) {
            console.log({ code: err.code, msg: err.message })
          })
      } else if (user) {
        setAuthUser(user)
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        setAuthUser(null)
        localStorage.clear()
      }
    })
    return () => unsubscribe()
  }, [])

  return authUser
}

export default useAuth
