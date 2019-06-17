var LoadedImgs = 0,
    getData = parseGetData(),
    href = window.location.href;

if( document.readyState !== 'loading' ) {
  initializeFeed()
} else {
  document.addEventListener('DOMContentLoaded', function () {
    initializeFeed();
  });
}

function initializeFeed() {
  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('unliked')) {
      if (event.target.hasAttribute('image_id')) {
      addLike(event.target);
      }
    } else if (event.target.classList.contains('liked')) {
      if (event.target.hasAttribute('image_id')) {
        removeLike(event.target);
      }
    } else if (event.target.classList.contains('delete')) {
      if (event.target.hasAttribute('image_id')) {
        deleteImage(event.target);
      } else if (event.target.parentElement.hasAttribute('comment_id')) {
        deleteComment(event.target.parentElement);
      }
    } else if (!event.target.classList.contains('username') && (event.target.classList.contains('element') ||
    event.target.classList.contains('elementData') || event.target.classList.contains('elementTitle') ||
    event.target.classList.contains('comments'))) {
      openPost(event.target);
    } else if (event.target.id == 'overlay' || event.target.id == 'close-post') {
      closePost();
    } else if (event.target.id == 'add-comment') {
      addComment();
    }
  }, false);

  document.addEventListener('scroll', function (event) {
    var scroll = document.body.scrollTop || window.scrollY;
    if (document.body.scrollHeight -
        scroll - window.innerHeight < 500) {
        loadFeed();
    }
  });

  if (getData && getData['img_id']) {
    while (document.querySelector('.element [image_id="'+ getData['img_id'] + '"]') == null && loadFeed()) {
      if (document.querySelector('.element [image_id="'+ getData['img_id'] + '"]')) {
        openPost(document.querySelector('.element [image_id="'+ getData['img_id'] + '"]'));
      }
    }
  } else {
    loadFeed();
  }
}

function addLike (button)
{
  xhr = new XMLHttpRequest(),
  params = 'action=addLike&image_id=' + button.getAttribute('image_id');
  xhr.open('POST', 'main/action', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.responseText == 'ok') {
        changelike(button);
      } else if (xhr.responseText != 'ko') {
        errorMsg(xhr.responseText);
      }
    }
  }
  xhr.send(params);
}

function removeLike (button)
{
  var xhr = new XMLHttpRequest(),
  image_id = button.getAttribute('image_id');
  params = 'action=removeLike&image_id=' + image_id;
  xhr.open('POST', 'main/action', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.responseText == 'ok') {
        changelike(button);
      } else if (xhr.responseText != 'ko') {
        errorMsg(xhr.responseText);
      }
    }
  }
  xhr.send(params);
}

function changelike(likeButton) {
  var postWindowLikes, feedLikes, likesCount, imageId;
  if (!(imageId = likeButton.getAttribute('image_id')) || !(postWindowLikes = document.querySelector('#post-likes'))
  || !(feedLikes = document.querySelector(".element[image_id='" + imageId + "'] .likes"))) {
    return;
  }
  likesCount = parseInt(feedLikes.querySelector('span').innerHTML);
  if (likeButton.className.match(/(?:^|\s)liked(?!\S)/) ) {
    postWindowLikes.querySelector('img').className = postWindowLikes.querySelector('img').className.replace(/(?:^|\s)liked(?!\S)/g , '');
    postWindowLikes.querySelector('img').className += "unliked";
    feedLikes.querySelector('img').className = feedLikes.querySelector('img').className.replace(/(?:^|\s)liked(?!\S)/g , '');
    feedLikes.querySelector('img').className += "unliked";
    if (likesCount > 0) {
      postWindowLikes.querySelector('span').innerHTML = likesCount - 1;
      feedLikes.querySelector('span').innerHTML = likesCount - 1;
    }
  } else {
    postWindowLikes.querySelector('img').className = postWindowLikes.querySelector('img').className.replace(/(?:^|\s)unliked(?!\S)/g , '');
    postWindowLikes.querySelector('img').className += "liked";
    feedLikes.querySelector('img').className = feedLikes.querySelector('img').className.replace(/(?:^|\s)unliked(?!\S)/g , '');
    feedLikes.querySelector('img').className += "liked";
    postWindowLikes.querySelector('span').innerHTML = likesCount + 1;
    feedLikes.querySelector('span').innerHTML = likesCount + 1;
  }
}

function deleteImage (button)
{
  if (!confirm('Are you sure want to delete this post.')) { return; }
  xhr = new XMLHttpRequest(),
  imageId = button.getAttribute('image_id');
  params = 'action=deleteImage&image_id=' + imageId;
  xhr.open('POST', 'main/action', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.responseText == 'ok') {
        closePost();
        document.querySelector('#feed').removeChild(document.querySelector(".element[image_id='" + imageId + "']"));
      } else {
        errorMsg(xhr.responseText);
      }
    }
  }
  xhr.send(params);
}

function openPost(element) {
/*
  xhr = new XMLHttpRequest(),
  params = 'action=getPost&image_id=' + getPostId(element);
  xhr.open('POST', 'main/action', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      var postData = xhr.responseText;
      alert(postData);
      if (postData.has['img_url']) {
        document.querySelector('#post-image').style.backgroundImage = postData['img_url'];      
      }
      if (postData.has[''])...
      ...
    }
  }
  xhr.send(params);
*/
  if (element == null) {
    errorMsg('Error occured. Reload page and try again');
    return;
  }
  document.querySelector('#overlay').style.display = "block";
  let post = document.querySelector('#post-window'),
      scroll = document.body.scrollTop || window.scrollY,
      currentGetData = "?",
      ampersand = false,
      imageId = getPostId(element);
  post.style.display = "flex";
  post.style.top = scroll + 70 + 'px';
  if (!element.className.match(/(?:^|\s)element(?!\S)/) && element.parentElement) {
    element = element.parentElement;
    if (!element.className.match(/(?:^|\s)element(?!\S)/) && element.parentElement) {
      element = element.parentElement;
    }
  }
  if (getData) {
    for (let prop in getData) {
      if (ampersand) {
        currentGetData += '&';
      }
      currentGetData += prop + "=" + getData[prop];
      ampersand = true;
    }
  }
  if (!getData || !getData['img_id']) {
    window.history.pushState("", "", ((getData) ? (currentGetData + '&') : ('/?')) + 'img_id=' + imageId);
  }
  document.querySelector('#post-window').setAttribute('image_id', imageId);
  document.querySelector('#post-image').style.backgroundImage = element.style.backgroundImage;
  document.querySelector('#like-post').className = element.querySelector('.likes img').className;
  document.querySelector('#like-post').setAttribute('image_id', imageId);
  document.querySelector('#post-likes span').innerHTML = element.querySelector('.likes span').innerHTML;
  document.querySelector('#post-description').innerHTML = element.querySelector('.elementTitle').innerHTML;
  document.querySelector('#post-author').innerHTML = element.querySelector('.username a').innerHTML;
  document.querySelector('#post-author').href = element.querySelector('.username a').href;
  document.querySelector('#delete-post').setAttribute('image_id', imageId);
  document.querySelector('#delete-post').style.display = (element.querySelector('.delete')) ? "inline": "none";
  document.querySelector('#post-comments-num').innerHTML = element.querySelector('.comments').innerHTML;
  showComments(imageId);
}

function closePost() {
  document.querySelector('#overlay').style.display = "none";
  document.querySelector('#post-window').style.display = "none";
  document.querySelector('#comment-text').value = "";
  if (getData && getData['img_id']) {
    if (getData['uid']) {
      href = href.split("?")[0] + '?uid=' + getData['uid'];
    } else {
      href = href.split("?")[0];
    }
  }
  window.history.pushState("", "", href);
}

function addComment() {
  var textarea = document.querySelector('#comment-text');
  if (textarea.value.length < 3 || textarea.value.length > 200) {
    errorMsg("Comment must have lenght between 3 and 200 characters.");
  } else {
    var xhr = new XMLHttpRequest(),
    image_id = document.querySelector('#post-window').getAttribute('image_id'),
    params = 'action=addComment&comment_text=' + encodeURIComponent(textarea.value) + '&image_id=' +
      image_id;
    xhr.open('POST', 'main/action', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        if (xhr.responseText == 'ok') {
          changeCommentsNum(image_id, 1);
          textarea.value = "";
          showComments(image_id);
        } else {
          errorMsg(xhr.responseText);
        }
      }
  }
  xhr.send(params);  
  }
}

function showComments(imageId) {
  var xhr = new XMLHttpRequest(),
  params = 'action=showComments&image_id=' + imageId;
  xhr.open('POST', 'main/action', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() { 
    if(xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.responseText != 'ko') {
        document.querySelector('#post-comments').innerHTML = xhr.responseText;
      } else {
        errorMsg(xhr.responseText);
      }
    }
  }
  xhr.send(params); 
}

function deleteComment(comment) {
  if (!confirm('Are you sure want to delete your comment')) {
    return;
  }
  var xhr = new XMLHttpRequest(),
  params = 'action=deleteComment&comment_id=' + comment.getAttribute('comment_id');
  xhr.open('POST', 'main/action', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() { 
    if(xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.responseText == 'ok') {
        comment.parentElement.removeChild(comment);
        changeCommentsNum(document.querySelector('#post-window').getAttribute('image_id'), -1);
      } else {
        errorMsg(xhr.responseText);
      }
    }
  }
  xhr.send(params); 
}

function changeCommentsNum(imageId, value) {
  var postCom = document.querySelector('#post-comments-num'),
  feedCom = feedLikes = document.querySelector(".element[image_id='" + imageId + "'] .comments");
  if (!postCom || !feedCom) {
    return;
  }
  comNumber = parseInt(feedCom.innerHTML) + value;
  feedCom.innerHTML = comNumber + ' comment' + ((comNumber == 1) ? '' : 's');
  postCom.innerHTML = feedCom.innerHTML;
}

function loadFeed() {
  if (LoadedImgs < 0) { return; }
  var loadIcon = document.querySelector('#feedLoad'),
  xhr = new XMLHttpRequest(),
  params = 'action=loadFeed&img_num=' + LoadedImgs;
  if (getData && getData['uid']) {
    params += "&uid=" + getData['uid'];
  }
  loadIcon.style.display = "block";
  xhr.open('POST', 'main/action', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      var feed = document.querySelector('#feed'),
      response = xhr.responseText;
      if (response == "") {
        LoadedImgs = -1;
        loadIcon.style.display = "none";
        return false;
      }
      var givenImages = parseInt(response);
      if (givenImages == 9) {
        LoadedImgs += parseInt(response);
      } else {
        LoadedImgs = -1;
      }
      response = response.substring(response.indexOf("<"));
      feed.innerHTML = feed.innerHTML + response;  
      loadIcon.style.display = "none";
      return true;
    }
  }
  xhr.send(params);
}

function getPostId(element) {
  var postId;
  if (postId = element.getAttribute('image_id')) {
    return postId;
  } else if (!element.className.match(/(?:^|\s)element(?!\S)/) && (element = element.parentElement)) {
    if (postId = element.getAttribute('image_id')) {
      return postId;
    } else if (!element.className.match(/(?:^|\s)element(?!\S)/) && (element = element.parentElement)) {
      if (postId = element.getAttribute('image_id')) {
        return postId;
      }
    }
  }
  return null;
}

function parseGetData() {
  var queryString = window.location.search.slice(1);
  if (!queryString) return null;
  queryString = queryString.split('#')[0];
  var arr = queryString.split('&'), obj = {};
  for (var i = 0; i < arr.length; i++) {
    var a = arr[i].split('=');
    var paramName = decodeURIComponent(a[0]);
    var paramValue = typeof (a[1]) === 'undefined' ? true : decodeURIComponent(a[1]);
    paramName = paramName.toLowerCase();
    obj[paramName] = paramValue;
  }
  return obj;
}

function errorMsg(msgString) {
  msgBox = document.getElementById("msg");
  msgBox.innerHTML = msgString;
  msgBox.className = "err-msg";
  msgBox.style.display = "block";
  msgBox.style.opacity = "1";
}