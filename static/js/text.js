document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('note-content');
  
    function splitBlock(currentBlock) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
  
      const range = selection.getRangeAt(0);
  
      // Создаем новый блок row-block
      const newRowBlock = document.createElement('div');
      newRowBlock.className = 'row-block';
  
      // Создаем новый editable-block для второй части текста
      const newBlock = document.createElement('div');
      newBlock.className = 'editable-block';
      newBlock.contentEditable = true;
  
      // Создаем side-block с svg
      const newSideBlock = document.createElement('div');
      newSideBlock.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><g fill="none" stroke="#1c1c1c" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><circle cx="6" cy="12" r="3"/><path stroke-linecap="round" stroke-linejoin="round" d="m15.408 6.512l-6.814 3.975m6.814 7.001l-6.814-3.975"/></g></svg>';
      newSideBlock.className = 'side-block';
      newSideBlock.addEventListener('click', () => linkButtonsClick(newSideBlock));
  
      // Создаем links-block
      const newLinksBlock = document.createElement('div');
      newLinksBlock.className = 'links-block';
  
      // Добавляем блоки в новый row-block
      newRowBlock.appendChild(newBlock);
      newRowBlock.appendChild(newSideBlock);
      newRowBlock.appendChild(newLinksBlock);
  
      // Клонируем содержимое после курсора в новый блок
      const afterRange = range.cloneRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(currentBlock, currentBlock.childNodes.length);
  
      const fragment = afterRange.extractContents();
      newBlock.appendChild(fragment);
  
      // Удаляем содержимое после курсора из текущего блока
      range.deleteContents();
  
      // Вставляем новый row-block после текущего
      const currentRowBlock = currentBlock.closest('.row-block');
      if (currentRowBlock) {
        currentRowBlock.after(newRowBlock);
      } else {
        currentBlock.after(newRowBlock);
      }
  
      // Устанавливаем курсор в начало нового блока
      const newRange = document.createRange();
      if (newBlock.firstChild) {
        newRange.setStart(newBlock.firstChild, 0);
      } else {
        const textNode = document.createTextNode('');
        newBlock.appendChild(textNode);
        newRange.setStart(textNode, 0);
      }
      newRange.collapse(true);
  
      selection.removeAllRanges();
      selection.addRange(newRange);
  
      // Фокусируемся на новом блоке
      newBlock.focus();
    }
  
    function mergeBlocks(currentBlock) {
      const prevBlock = currentBlock.previousElementSibling;
      if (!prevBlock || !prevBlock.classList.contains('editable-block')) {
        const prevRow = currentBlock.closest('.row-block')?.previousElementSibling;
        if (prevRow && prevRow.classList.contains('row-block')) {
          const prevEditableBlock = prevRow.querySelector('.editable-block');
          if (prevEditableBlock) {
            mergeBlocksFromRows(currentBlock, prevEditableBlock);
            return;
          }
        }
        return;
      }
  
      // Сохраняем позицию слияния (длина текста в предыдущем блоке)
      const prevTextLength = prevBlock.textContent.length;
  
      // Переносим все дочерние узлы из currentBlock в prevBlock
      while (currentBlock.firstChild) {
        prevBlock.appendChild(currentBlock.firstChild);
      }
      currentBlock.remove();
  
      // Удаляем боковой блок и links-block текущего ряда
      const currentRow = currentBlock.closest('.row-block');
      const currentSideBlock = currentRow?.querySelector('.side-block');
      if (currentSideBlock) currentSideBlock.remove();
  
      const currentLinksBlock = currentRow?.querySelector('.links-block');
      if (currentLinksBlock) {
        currentLinksBlock.remove();
        console.log('Удалилось');
        updateConnects();
      }
  
      // Удаляем пустой row-block
      if (currentRow && currentRow.children.length === 0) {
        currentRow.remove();
      }
  
      // Устанавливаем курсор в позицию слияния
      const newRange = document.createRange();
      const textNode = prevBlock.firstChild || document.createTextNode('');
      if (!prevBlock.firstChild) prevBlock.appendChild(textNode);
  
      newRange.setStart(textNode, prevTextLength);
      newRange.collapse(true);
  
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);
      prevBlock.focus();
  
      saveNote();
    }
  
    function mergeBlocksFromRows(currentBlock, prevBlock) {
      const prevTextLength = prevBlock.textContent.length;
  
      // Переносим все дочерние узлы из currentBlock в prevBlock
      while (currentBlock.firstChild) {
        prevBlock.appendChild(currentBlock.firstChild);
      }
      const currentRow = currentBlock.closest('.row-block');
      currentBlock.remove();
  
      const currentSideBlock = currentRow?.querySelector('.side-block');
      if (currentSideBlock) currentSideBlock.remove();
  
      const currentLinksBlock = currentRow?.querySelector('.links-block');
      if (currentLinksBlock) {
        currentLinksBlock.remove();
        console.log('Удалилось');
        updateConnects();
      }
  
      if (currentRow && currentRow.children.length === 0) {
        currentRow.remove();
      }
  
      // Устанавливаем курсор в позицию слияния
      const newRange = document.createRange();
      const textNode = prevBlock.firstChild || document.createTextNode('');
      if (!prevBlock.firstChild) prevBlock.appendChild(textNode);
  
      newRange.setStart(textNode, prevTextLength);
      newRange.collapse(true);
  
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);
      prevBlock.focus();
  
      saveNote();
    }
  
    container.addEventListener('keydown', (e) => {
      const block = e.target.closest('.editable-block');
      if (!block) return;
  
      if (e.key === 'Enter') {
        e.preventDefault();
        splitBlock(block);
      }
  
      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
  
        const range = selection.getRangeAt(0);
        if (range.startOffset === 0 && range.endOffset === 0) {
          e.preventDefault();
          const prevBlock = block.previousElementSibling;
          if (prevBlock && prevBlock.classList.contains('image-block')) {
            prevBlock.remove();
          } else {
            mergeBlocks(block);
          }
        }
      }
    });
  });
  