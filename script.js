<script>
    // ========================================
    // CONFIGURAZIONE JS (Deve corrispondere a Code.gs)
    // ========================================
    const ORARI_APERTURA = {
        pranzo: { inizio: "12:00", fine: "15:00" },
        cena: { inizio: "19:00", fine: "23:00" }
    };

    const PREZZI_ARTICOLI = {
        cuddruriaddri: 1.50,
        panzerotti: 2.50,
        vecchiareddre: 2.00
    };

    const articleNames = Object.keys(PREZZI_ARTICOLI);
    const prices = PREZZI_ARTICOLI;

    // ========================================
    // NAVIGAZIONE
    // ========================================

    function showSection(section) {
        console.log('🔍 Apertura sezione:', section);
        
        // Ottieni gli elementi ogni volta che la funzione viene chiamata
        const mainMenu = document.getElementById('main-menu');
        const tavoliSection = document.getElementById('tavoli-section');
        const asportoSection = document.getElementById('asporto-section');
        const infoSection = document.getElementById('info-section');
        const statusModal = document.getElementById('status-modal');
        
        if (!mainMenu || !tavoliSection || !asportoSection || !infoSection) {
            console.error('❌ Elementi non trovati!');
            return;
        }
        
        // Nascondi tutte le sezioni
        mainMenu.classList.add('hidden');
        tavoliSection.classList.add('hidden');
        asportoSection.classList.add('hidden');
        infoSection.classList.add('hidden');
        if (statusModal) statusModal.classList.add('hidden');

        // Mostra la sezione richiesta
        if (section === 'tavoli') {
            tavoliSection.classList.remove('hidden');
            console.log('✅ Sezione tavoli aperta');
        } else if (section === 'asporto') {
            asportoSection.classList.remove('hidden');
            console.log('✅ Sezione asporto aperta');
        } else if (section === 'info') {
            infoSection.classList.remove('hidden');
            console.log('✅ Sezione info aperta');
        } else {
            mainMenu.classList.remove('hidden');
            console.log('✅ Menu principale aperto');
        }
    }

    function openModal(title, message, callback, isError = false) {
        const statusModal = document.getElementById('status-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalIcon = document.getElementById('modal-icon');
        const modalCloseButton = statusModal.querySelector('button');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalCloseButton.onclick = callback || closeModal;

        if (isError) {
            modalTitle.className = 'text-3xl font-bold mb-4 text-red-700';
            modalIcon.className = 'w-20 h-20 mx-auto text-red-500 mb-6';
            modalIcon.querySelector('path').setAttribute('d', 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z');
        } else {
            modalTitle.className = 'text-3xl font-bold mb-4 text-green-700';
            modalIcon.className = 'w-20 h-20 mx-auto text-green-500 mb-6';
            modalIcon.querySelector('path').setAttribute('d', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z');
        }
        statusModal.classList.remove('hidden');
    }

    function closeModal() {
        const statusModal = document.getElementById('status-modal');
        statusModal.classList.add('hidden');
        
        const tavoliForm = document.getElementById('tavoli-form');
        const asportoForm = document.getElementById('asporto-form');
        
        if (tavoliForm) tavoliForm.reset();
        if (asportoForm) asportoForm.reset();

        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        articleNames.forEach(item => {
            const input = document.getElementById(`input_${item}`);
            const checkbox = document.getElementById(`check_${item}`);
            const icon = document.getElementById(`icon_${item}`);
            
            if (checkbox) checkbox.checked = false;
            if (input) {
                input.disabled = true;
                input.value = 0;
                input.classList.add('disabled-input');
            }
            if (icon) icon.classList.remove('checked');
            
            const stepperDiv = input ? input.parentNode : null;
            if (stepperDiv) {
                const minusButton = stepperDiv.querySelector('.stepper-button:nth-child(1)');
                const plusButton = stepperDiv.querySelector('.stepper-button:nth-child(3)');
                if (minusButton) minusButton.disabled = true;
                if (plusButton) plusButton.disabled = true;
            }
        });
        updateTotal();
        showSection('menu');
    }

    // ========================================
    // VALIDAZIONE
    // ========================================

    function validaOrarioClient(time) {
        if (!time) return false;
        const oraMinuti = timeToMinutes(time);
        const pranzoDa = timeToMinutes(ORARI_APERTURA.pranzo.inizio);
        const pranzoA = timeToMinutes(ORARI_APERTURA.pranzo.fine);
        const cenaDa = timeToMinutes(ORARI_APERTURA.cena.inizio);
        const cenaA = timeToMinutes(ORARI_APERTURA.cena.fine);
        return (oraMinuti >= pranzoDa && oraMinuti <= pranzoA) || (oraMinuti >= cenaDa && oraMinuti <= cenaA);
    }

    function timeToMinutes(time) {
        const [ore, minuti] = time.split(':').map(Number);
        return ore * 60 + minuti;
    }

    function validaTelefonoClient(telefono) {
        if (!telefono) return false;
        const regex = /^(?:(?:\+|00)39)?\d{9,11}$/;
        return regex.test(telefono.replace(/\s/g, ''));
    }

    function mostraErrore(inputId, errorId, messaggio) {
        const input = document.querySelector(`[name="${inputId}"]`) || document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input) input.classList.add('error');
        if (error) {
            error.textContent = messaggio;
            error.classList.add('show');
        }
    }

    function nascondiErrore(inputId, errorId) {
        const input = document.querySelector(`[name="${inputId}"]`) || document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input) input.classList.remove('error');
        if (error) error.classList.remove('show');
    }

    // ========================================
    // FUNZIONI ASPORTO
    // ========================================

    function updateTotal() {
        let total = 0;
        articleNames.forEach(item => {
            const input = document.getElementById(`input_${item}`);
            if (input && !input.disabled) {
                const quantity = parseInt(input.value) || 0;
                total += quantity * prices[item];
            }
        });
        const totalElement = document.getElementById('order-total');
        if (totalElement) {
            totalElement.textContent = `€ ${total.toFixed(2)}`;
        }
        return total;
    }

    function updateStepperButtons(itemName, quantity) {
        const input = document.getElementById(`input_${itemName}`);
        if (!input) return;
        
        const stepperDiv = input.parentNode;
        const minusButton = stepperDiv.querySelector('.stepper-button:nth-child(1)');
        const plusButton = stepperDiv.querySelector('.stepper-button:nth-child(3)');
        if (minusButton) minusButton.disabled = quantity <= 1;
    }

    function changeQuantity(itemName, delta) {
        const input = document.getElementById(`input_${itemName}`);
        if (!input) return;
        
        const currentVal = parseInt(input.value) || 0;
        const newVal = currentVal + delta;
        
        if (newVal >= 1) {
            input.value = newVal;
            updateStepperButtons(itemName, newVal);
        }
        
        if (newVal === 0) {
            const checkbox = document.getElementById(`check_${itemName}`);
            if (checkbox) checkbox.checked = false;
            toggleQuantityInput(itemName, false);
        }
        updateTotal();
    }

    function toggleQuantityInput(itemName, isChecked) {
        const input = document.getElementById(`input_${itemName}`);
        const icon = document.getElementById(`icon_${itemName}`);
        
        if (!input) return;
        
        const stepperDiv = input.parentNode;
        const minusButton = stepperDiv.querySelector('.stepper-button:nth-child(1)');
        const plusButton = stepperDiv.querySelector('.stepper-button:nth-child(3)');

        if (isChecked) {
            input.disabled = false;
            input.value = 1;
            input.classList.remove('disabled-input');
            if (icon) icon.classList.add('checked');
            if (minusButton) minusButton.disabled = true;
            if (plusButton) plusButton.disabled = false;
        } else {
            input.disabled = true;
            input.value = 0;
            input.classList.add('disabled-input');
            if (icon) icon.classList.remove('checked');
            if (minusButton) minusButton.disabled = true;
            if (plusButton) plusButton.disabled = true;
        }
        updateTotal();
    }

    // ========================================
    // GESTIONE FORM
    // ========================================

    function handleTavoliSubmit(e) {
        e.preventDefault();

        document.querySelectorAll('#tavoli-section .error-message').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('#tavoli-section .error').forEach(el => el.classList.remove('error'));

        const form = e.target;
        const formData = {};
        const elements = form.elements;
        
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.name) {
                formData[element.name] = element.value;
            }
        }

        if (!validaTelefonoClient(formData.telefono)) {
            mostraErrore('telefono', 'error-telefono-tavoli', 'Formato telefono non valido');
            return;
        }

        const numPersone = parseInt(formData.num_persone);
        if (isNaN(numPersone) || numPersone < 1 || numPersone > 20) {
            mostraErrore('num_persone', 'error-persone', 'Il numero di persone deve essere tra 1 e 20');
            return;
        }

        if (!validaOrarioClient(formData.ora_arrivo)) {
            mostraErrore('tavoli_ora_arrivo', 'error-ora-tavoli', `Orario non valido. Aperti: ${ORARI_APERTURA.pranzo.inizio}-${ORARI_APERTURA.pranzo.fine} e ${ORARI_APERTURA.cena.inizio}-${ORARI_APERTURA.cena.fine}`);
            return;
        }

        const submitButton = document.getElementById('submit-tavoli');
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.innerHTML = `Invio in corso... <span class="spinner"></span>`;

       fetch('https://script.google.com/macros/s/AKfycbw3onsDk9FcuqLNJxW7TDZQo-zvD8SOj8cnLe2by5ZkAtFH3gMQPoSajEviwxDQi3nqDQ/exec?action=prenotaTavolo&data=' + encodeURIComponent(JSON.stringify(formData)))
    .then(r => r.json())
    .then(function(response) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        if (response.success) {
            openModal('Prenotazione Ricevuta!', 'Ti contatteremo a breve al numero fornito per i dettagli. Grazie!', closeModal, false);
        } else {
            openModal('⚠️ Errore Prenotazione', response.message, closeModal, true);
        }
    })
    .catch(function(error) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        openModal('⚠️ Errore Tecnico', 'Si è verificato un errore durante l\'invio. Riprova più tardi.', closeModal, true);
    });

    function handleAsportoSubmit(e) {
        e.preventDefault();

        document.querySelectorAll('#asporto-section .error-message').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('#asporto-section .error').forEach(el => el.classList.remove('error'));

        const form = e.target;
        const formData = {};
        const elements = form.elements;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.name) {
                if (articleNames.includes(element.name)) {
                    formData[element.name] = parseInt(element.value) || 0;
                } else {
                    formData[element.name] = element.value;
                }
            }
        }

        let totalItems = 0;
        articleNames.forEach(item => {
            totalItems += formData[item] || 0;
        });

        if (totalItems <= 0) {
            openModal('⚠️ Attenzione', 'Devi selezionare almeno un prodotto per completare l\'ordine.', null, true);
            return;
        }

        if (!validaTelefonoClient(formData.telefono)) {
            mostraErrore('telefono', 'error-telefono-asporto', 'Formato telefono non valido');
            return;
        }

        if (!validaOrarioClient(formData.ora_ritiro)) {
            mostraErrore('asporto_ora_ritiro', 'error-ora-asporto', `Orario non valido. Aperti: ${ORARI_APERTURA.pranzo.inizio}-${ORARI_APERTURA.pranzo.fine} e ${ORARI_APERTURA.cena.inizio}-${ORARI_APERTURA.cena.fine}`);
            return;
        }

        formData.totale = updateTotal();

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = `Invio in corso... <span class="spinner"></span>`;

       fetch('https://script.google.com/macros/s/AKfycbw3onsDk9FcuqLNJxW7TDZQo-zvD8SOj8cnLe2by5ZkAtFH3gMQPoSajEviwxDQi3nqDQ/exec?action=prenotaTavolo&data=' + encodeURIComponent(JSON.stringify(formData)))
    .then(r => r.json())
    .then(function(response) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        if (response.success) {
            openModal('Prenotazione Ricevuta!', 'Ti contatteremo a breve al numero fornito per i dettagli. Grazie!', closeModal, false);
        } else {
            openModal('⚠️ Errore Prenotazione', response.message, closeModal, true);
        }
    })
    .catch(function(error) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        openModal('⚠️ Errore Tecnico', 'Si è verificato un errore durante l\'invio. Riprova più tardi.', closeModal, true);
    });

    // ========================================
    // EVENT LISTENERS
    // ========================================

    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ DOM Caricato');
        
        const tavoliForm = document.getElementById('tavoli-form');
        const asportoForm = document.getElementById('asporto-form');
        
        if (tavoliForm) {
            tavoliForm.addEventListener('submit', handleTavoliSubmit);
            console.log('✅ Form tavoli collegato');
        }
        
        if (asportoForm) {
            asportoForm.addEventListener('submit', handleAsportoSubmit);
            console.log('✅ Form asporto collegato');
        }

        updateTotal();

        document.querySelectorAll('input[name="telefono"]').forEach(input => {
            input.addEventListener('blur', function() {
                const errorId = this.closest('#tavoli-section') ? 'error-telefono-tavoli' : 'error-telefono-asporto';
                if (this.value && !validaTelefonoClient(this.value)) {
                    mostraErrore('telefono', errorId, 'Formato: 3331234567 o +393331234567');
                } else {
                    nascondiErrore('telefono', errorId);
                }
            });
        });
        
        const tavoliOra = document.getElementById('tavoli_ora_arrivo');
        if (tavoliOra) {
            tavoliOra.addEventListener('blur', function() {
                if (this.value && !validaOrarioClient(this.value)) {
                    mostraErrore('tavoli_ora_arrivo', 'error-ora-tavoli', 'Orario fuori dagli orari di apertura');
                } else {
                    nascondiErrore('tavoli_ora_arrivo', 'error-ora-tavoli');
                }
            });
        }
        
        const asportoOra = document.getElementById('asporto_ora_ritiro');
        if (asportoOra) {
            asportoOra.addEventListener('blur', function() {
                if (this.value && !validaOrarioClient(this.value)) {
                    mostraErrore('asporto_ora_ritiro', 'error-ora-asporto', 'Orario fuori dagli orari di apertura');
                } else {
                    nascondiErrore('asporto_ora_ritiro', 'error-ora-asporto');
                }
            });
        }
    });

</script>
