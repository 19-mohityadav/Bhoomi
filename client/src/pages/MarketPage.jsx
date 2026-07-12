import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Grid Background CSS helper or other styles
const styles = `
  @keyframes ledgerPulse {
    0% { transform: scale(0.95); opacity: 0.7; }
    70% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.7; }
  }
  .ledger-pulse-animated {
    animation: ledgerPulse 2s infinite;
  }
`;

const INITIAL_LANDS = [
  // Page 1
  {
    id: 'LV-48201',
    name: 'Neon Zenith Heights',
    price: 2.5,
    usdPrice: 5840.00,
    owner: '0x4a...3e92',
    fullOwner: '0x4a8b753c90e290f11db89000a12e3e92',
    area: 4200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzWoZ9XHdraHuKsruDVenKnSg_ljRD5f0lRNXEjjLR7tSpnuOtOOZz8F_E65O3fbgrqjyg2cvPjYN9gXKsdi2K7laBqBzOlCEStDqImeBVxad-b5FFabjx5qqbkYONfWFM_PMuVtnjc3SWF6lLp3xWtu1VR78HOwzO5khV1Llw48JiE5MQnKXYG_m7ELz_xznqQJlo_P9XgRUcI9U32w-qnGqnqg5zcBOupXp3O5Eg1nH64z4WfLmYXk9ft0Idvmz16LKO1qWFvobi',
    verified: true,
    region: 'Heights',
    coordinates: '42.3601° N, 71.0589° W',
    page: 1
  },
  {
    id: 'LV-91223',
    name: 'Obsidian Rift Valley',
    price: 4.8,
    usdPrice: 11210.00,
    owner: '0x9b...1f12',
    fullOwner: '0x9b5d21fe829aa1828cb0f124b89e1f12',
    area: 8500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeau8hkXkDNK6Nr_BaFj2SyJ330UjDaguDZzZI4EDVxsB-2t2iQWd9U6eeuDzTUnlzLdu6BISKgVoxLEFA_IvMyqsaR5x0nxhjeINeQPMetg8IskIDpUDFfUYCBLGSzRb7WhidQ9xep2byXLLzvh_NFv-JaVlCixFaGJLDsbHeYuY-eFV0Cqn1Vg8YZWCHF6rJb_X9CoOOdpH3t2LWkG3QHgidwPUxD74hGtmPbOm0lSzRrXvO1xwkDjpWBE9g6ZeycQbozg9P9P8x',
    verified: true,
    region: 'Valley',
    coordinates: '34.0522° N, 118.2437° W',
    page: 1
  },
  {
    id: 'LV-12005',
    name: 'Ethereal Plain III',
    price: 1.2,
    usdPrice: 2800.00,
    owner: '0xcc...aa88',
    fullOwner: '0xecca88bf99ee32ab12f6cd99aa888c3a',
    area: 2100,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmRKc4pCgz7fZznE2gFWXS-usBIQe6SISRZ-q_1d0AlNO3BqHdM-Ek7mgF9a6Lnrgsjuq9fg8802UHAXmZ6HtB_lTxxklafsv1NNEM_az2r3ysTHByqXXjhckZ4odMhx5f_82Z5FnFPDpqTlBEdHUlhlp97hfB7yu5vP2O7fAUmCgwvxivvBAS_eFY7rTNc6ERW-mNB7POHuZ321nTClhqDAqFtRGqtGsDWcPGugjI7sCYpw7LB8pyxnD4bPW2m-RlaeACXDfsB82f',
    verified: true,
    region: 'Plain',
    coordinates: '51.5074° N, 0.1278° W',
    page: 1
  },
  {
    id: 'LV-66710',
    name: 'Prism Coast District',
    price: 6.4,
    usdPrice: 14950.00,
    owner: '0xfe...0031',
    fullOwner: '0xfe0031cb67aa229ef5e003120199aa12',
    area: 12000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHzAkNxPPcKNNMuaEyROjKLqWjPzsVaVFAi60oe6YgOLdExaku-jDlM1tVHlcNzLK6A7-IuAbM-6VeMuhpqOGOBCphPxiK8AEq-lJ_SJdnqA2iIjTAYIidIQDjVymwqvz9CnW-3gv9qF_BDI5K0bvCwAzawntJggewdAebLiTtrGQdHT869EM1qE1FRzuh77dbaCCAf86vxnZTAH-1H9xkmQ9Ei8IvCrqg_o3ckbdnYw74ONrlgSe4q4atSpbnwCpXfg_5wPqE6QkV',
    verified: true,
    region: 'Coast',
    coordinates: '48.8566° N, 2.3522° E',
    page: 1
  },
  {
    id: 'LV-33044',
    name: 'Cyan Silence Core',
    price: 3.2,
    usdPrice: 7480.00,
    owner: '0x21...bbcc',
    fullOwner: '0x21bbcc8d2345ef01bbcc99eeffaaccb2',
    area: 5600,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV0f9wP-mhetL0XIljeDJLkZtDOQjp4nMUrK98hydadxYfExv4y7g9UYIJsTBRTCHCpQhPxfBAyBAYTOagsZeRAqXhhNIIaSu0TY6O0K8ALuEtO9lae90U-9w00PP31Ud0yC7e6J3Xhhj0rcuF6OFlNzlthveJ91MO-tq9AEjz0dbXE7xyNkY-FQhFPR94ps-XUFVr9L_7D9owgF7vGKqrPBYGDQ8A9uCpM1ELwUBXh_vm7MNwc4Zfuho4Zp76GSd5E_21JJhql5yK',
    verified: true,
    region: 'Core',
    coordinates: '35.6762° N, 139.6503° E',
    page: 1
  },
  {
    id: 'LV-00921',
    name: 'Data Stream Gardens',
    price: 1.9,
    usdPrice: 4440.00,
    owner: '0x99...eeff',
    fullOwner: '0x99eeffaa88dd99cc11bbaacc99eeffee',
    area: 3300,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS1e9KqS5yTjO9eAk46VTX042jTNNLqN3Z4LSdsZElWSLbAzjzcY2l2ksl-OB9DjMqcdpZzfvfJyZr_O0wFeAtx8hbbwpmKlhLEJPWsQbzsa2MkL4ZqSlJP7pjuBrlQWc-aqDDacfR81KREHsDIizTFfMTkqMWdwMYUFq513mRqacPDlE08fx3rqi3uiPpTskpJQ2moyNb8r_VbB5fst1TB3hHtiAYHk1rUUgLiTgUB0wXuX80OdG1mAaGQQX2mP7VDE558lqy4zkd',
    verified: true,
    region: 'Gardens',
    coordinates: '25.2048° N, 55.2708° E',
    page: 1
  },

  // Page 2
  {
    id: 'LV-11204',
    name: 'Nexus Helix Apex',
    price: 5.1,
    usdPrice: 11900.00,
    owner: '0xbc...df01',
    fullOwner: '0xbc01df01bbaacc1192efda0192e2df01',
    area: 7200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTHk7S3F-bKLRTsMlCOiK5FUTfl8k2N26eG-MDNkrV0joDJ118dj4NHEf6fXxpKOvX70afNwVuQviouu5zdxZjOFXWQkiFu7ngIPRUkMivdlGQycPsg5CS-3gniKxDjTPFn1S51kPrMWrGIoCnaygPJZa5swDiAdvURqesOlGYrK4ISJShcgwurx1xSd0XnBT-W5YoGeDmJlr_u8wS2Xma3NODFsTUEw_mAHxUKN7CqG_5tTU1Nrly40U4FOhwPmleiscK9U2cCyut',
    verified: true,
    region: 'Heights',
    coordinates: '40.7128° N, 74.0060° W',
    page: 2
  },
  {
    id: 'LV-58392',
    name: 'Quantum Rift Ridge',
    price: 3.7,
    usdPrice: 8650.00,
    owner: '0x4d...bc39',
    fullOwner: '0x4dbc39ee82bbaacc1199eeffccaabc39',
    area: 6100,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbPIpKmurIl87B6L9xfw4UZa_t1qgVbg09uLe8zs5Rlp9WWUc5kFK5nA-ruQNtJHN3fKhK-QKOca6gY56wvPWwwIXJn-JxPSO9DqNgtrkjDUv4QPjx_6fgK2YsR3a3b_XSVqfmfnhLDVpj5gHZ7nMdqJrVz_2ZjhXmlJ3Yi_UkKd6_exPaeSFGybCYeu2voJ_EkuPtGeqL14FAoYXEJwRzhKlnzNEMngA0j3DQ93jDaKT7YzD5kM-8gt53biGaeXv4QrYKZi0xfh1a',
    verified: true,
    region: 'Valley',
    coordinates: '37.7749° N, 122.4194° W',
    page: 2
  },
  {
    id: 'LV-88201',
    name: 'Chrome Dunes IV',
    price: 0.9,
    usdPrice: 2100.00,
    owner: '0x3a...e4d2',
    fullOwner: '0x3ae4d2aa99eeffcca123ffaa99eedd32',
    area: 1800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmRKc4pCgz7fZznE2gFWXS-usBIQe6SISRZ-q_1d0AlNO3BqHdM-Ek7mgF9a6Lnrgsjuq9fg8802UHAXmZ6HtB_lTxxklafsv1NNEM_az2r3ysTHByqXXjhckZ4odMhx5f_82Z5FnFPDpqTlBEdHUlhlp97hfB7yu5vP2O7fAUmCgwvxivvBAS_eFY7rTNc6ERW-mNB7POHuZ321nTClhqDAqFtRGqtGsDWcPGugjI7sCYpw7LB8pyxnD4bPW2m-RlaeACXDfsB82f',
    verified: false,
    region: 'Plain',
    coordinates: '22.3193° N, 114.1694° E',
    page: 2
  },
  {
    id: 'LV-24901',
    name: 'Vapor Horizon Shores',
    price: 8.2,
    usdPrice: 19150.00,
    owner: '0x8b...3219',
    fullOwner: '0x8b321900eeddbbaaccff1122aacc3219',
    area: 15000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzWoZ9XHdraHuKsruDVenKnSg_ljRD5f0lRNXEjjLR7tSpnuOtOOZz8F_E65O3fbgrqjyg2cvPjYN9gXKsdi2K7laBqBzOlCEStDqImeBVxad-b5FFabjx5qqbkYONfWFM_PMuVtnjc3SWF6lLp3xWtu1VR78HOwzO5khV1Llw48JiE5MQnKXYG_m7ELz_xznqQJlo_P9XgRUcI9U32w-qnGqnqg5zcBOupXp3O5Eg1nH64z4WfLmYXk9ft0Idvmz16LKO1qWFvobi',
    verified: true,
    region: 'Coast',
    coordinates: '-33.8688° S, 151.2093° E',
    page: 2
  },
  {
    id: 'LV-44910',
    name: 'Solar Grid Node',
    price: 2.8,
    usdPrice: 6540.00,
    owner: '0xab...f201',
    fullOwner: '0xabf201c0eeddbbaaccff88880011f201',
    area: 4900,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV0f9wP-mhetL0XIljeDJLkZtDOQjp4nMUrK98hydadxYfExv4y7g9UYIJsTBRTCHCpQhPxfBAyBAYTOagsZeRAqXhhNIIaSu0TY6O0K8ALuEtO9lae90U-9w00PP31Ud0yC7e6J3Xhhj0rcuF6OFlNzlthveJ91MO-tq9AEjz0dbXE7xyNkY-FQhFPR94ps-XUFVr9L_7D9owgF7vGKqrPBYGDQ8A9uCpM1ELwUBXh_vm7MNwc4Zfuho4Zp76GSd5E_21JJhql5yK',
    verified: true,
    region: 'Core',
    coordinates: '1.3521° N, 103.8198° E',
    page: 2
  },
  {
    id: 'LV-09231',
    name: 'Flowing Code Atrium',
    price: 4.1,
    usdPrice: 9590.00,
    owner: '0x71...5591',
    fullOwner: '0x71559102dd99cc11bbaacc99eeffee88',
    area: 6800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS1e9KqS5yTjO9eAk46VTX042jTNNLqN3Z4LSdsZElWSLbAzjzcY2l2ksl-OB9DjMqcdpZzfvfJyZr_O0wFeAtx8hbbwpmKlhLEJPWsQbzsa2MkL4ZqSlJP7pjuBrlQWc-aqDDacfR81KREHsDIizTFfMTkqMWdwMYUFq513mRqacPDlE08fx3rqi3uiPpTskpJQ2moyNb8r_VbB5fst1TB3hHtiAYHk1rUUgLiTgUB0wXuX80OdG1mAaGQQX2mP7VDE558lqy4zkd',
    verified: true,
    region: 'Gardens',
    coordinates: '-23.5505° S, -46.6333° W',
    page: 2
  },

  // Page 3
  {
    id: 'LV-28491',
    name: 'Glitch Valley Citadel',
    price: 9.5,
    usdPrice: 22180.00,
    owner: '0xcd...88bb',
    fullOwner: '0xcd88bbaa99ee32aacc118822ffccaabb',
    area: 18000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHzAkNxPPcKNNMuaEyROjKLqWjPzsVaVFAi60oe6YgOLdExaku-jDlM1tVHlcNzLK6A7-IuAbM-6VeMuhpqOGOBCphPxiK8AEq-lJ_SJdnqA2iIjTAYIidIQDjVymwqvz9CnW-3gv9qF_BDI5K0bvCwAzawntJggewdAebLiTtrGQdHT869EM1qE1FRzuh77dbaCCAf86vxnZTAH-1H9xkmQ9Ei8IvCrqg_o3ckbdnYw74ONrlgSe4q4atSpbnwCpXfg_5wPqE6QkV',
    verified: true,
    region: 'Valley',
    coordinates: '55.7558° N, 37.6173° E',
    page: 3
  },
  {
    id: 'LV-77391',
    name: 'Synthetica Coast Bay',
    price: 1.8,
    usdPrice: 4200.00,
    owner: '0x0f...dd32',
    fullOwner: '0x0fdd32aa88dd99cc11bbaacc99eeffee',
    area: 3100,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeau8hkXkDNK6Nr_BaFj2SyJ330UjDaguDZzZI4EDVxsB-2t2iQWd9U6eeuDzTUnlzLdu6BISKgVoxLEFA_IvMyqsaR5x0nxhjeINeQPMetg8IskIDpUDFfUYCBLGSzRb7WhidQ9xep2byXLLzvh_NFv-JaVlCixFaGJLDsbHeYuY-eFV0Cqn1Vg8YZWCHF6rJb_X9CoOOdpH3t2LWkG3QHgidwPUxD74hGtmPbOm0lSzRrXvO1xwkDjpWBE9g6ZeycQbozg9P9P8x',
    verified: true,
    region: 'Coast',
    coordinates: '39.9042° N, 116.4074° E',
    page: 3
  },
  {
    id: 'LV-51029',
    name: 'Monochrome Plain II',
    price: 0.7,
    usdPrice: 1630.00,
    owner: '0x55...39f1',
    fullOwner: '0x5539f112eeddccaacc8899aacc99ffaa',
    area: 1400,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmRKc4pCgz7fZznE2gFWXS-usBIQe6SISRZ-q_1d0AlNO3BqHdM-Ek7mgF9a6Lnrgsjuq9fg8802UHAXmZ6HtB_lTxxklafsv1NNEM_az2r3ysTHByqXXjhckZ4odMhx5f_82Z5FnFPDpqTlBEdHUlhlp97hfB7yu5vP2O7fAUmCgwvxivvBAS_eFY7rTNc6ERW-mNB7POHuZ321nTClhqDAqFtRGqtGsDWcPGugjI7sCYpw7LB8pyxnD4bPW2m-RlaeACXDfsB82f',
    verified: false,
    region: 'Plain',
    coordinates: '19.4326° N, -99.1332° W',
    page: 3
  },
  {
    id: 'LV-00492',
    name: 'Echo Silence Spire',
    price: 3.0,
    usdPrice: 7000.00,
    owner: '0xfa...a212',
    fullOwner: '0xfaa212ddaa8822abccdd99aaffeedd22',
    area: 5200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV0f9wP-mhetL0XIljeDJLkZtDOQjp4nMUrK98hydadxYfExv4y7g9UYIJsTBRTCHCpQhPxfBAyBAYTOagsZeRAqXhhNIIaSu0TY6O0K8ALuEtO9lae90U-9w00PP31Ud0yC7e6J3Xhhj0rcuF6OFlNzlthveJ91MO-tq9AEjz0dbXE7xyNkY-FQhFPR94ps-XUFVr9L_7D9owgF7vGKqrPBYGDQ8A9uCpM1ELwUBXh_vm7MNwc4Zfuho4Zp76GSd5E_21JJhql5yK',
    verified: true,
    region: 'Core',
    coordinates: '30.0444° N, 31.2357° E',
    page: 3
  },
  {
    id: 'LV-30048',
    name: 'Grid Stream Gardens V',
    price: 2.2,
    usdPrice: 5140.00,
    owner: '0x00...eedd',
    fullOwner: '0x00eeddffbbaacc44eeffeebbaacc4412',
    area: 3800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS1e9KqS5yTjO9eAk46VTX042jTNNLqN3Z4LSdsZElWSLbAzjzcY2l2ksl-OB9DjMqcdpZzfvfJyZr_O0wFeAtx8hbbwpmKlhLEJPWsQbzsa2MkL4ZqSlJP7pjuBrlQWc-aqDDacfR81KREHsDIizTFfMTkqMWdwMYUFq513mRqacPDlE08fx3rqi3uiPpTskpJQ2moyNb8r_VbB5fst1TB3hHtiAYHk1rUUgLiTgUB0wXuX80OdG1mAaGQQX2mP7VDE558lqy4zkd',
    verified: true,
    region: 'Gardens',
    coordinates: '55.6761° N, 12.5683° E',
    page: 3
  },
  {
    id: 'LV-90412',
    name: 'Nebula Zenith Heights',
    price: 7.0,
    usdPrice: 16350.00,
    owner: '0x4a...3e92',
    fullOwner: '0x4a8b753c90e290f11db89000a12e3e92',
    area: 11000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzWoZ9XHdraHuKsruDVenKnSg_ljRD5f0lRNXEjjLR7tSpnuOtOOZz8F_E65O3fbgrqjyg2cvPjYN9gXKsdi2K7laBqBzOlCEStDqImeBVxad-b5FFabjx5qqbkYONfWFM_PMuVtnjc3SWF6lLp3xWtu1VR78HOwzO5khV1Llw48JiE5MQnKXYG_m7ELz_xznqQJlo_P9XgRUcI9U32w-qnGqnqg5zcBOupXp3O5Eg1nH64z4WfLmYXk9ft0Idvmz16LKO1qWFvobi',
    verified: true,
    region: 'Heights',
    coordinates: '-26.2041° S, 28.0473° E',
    page: 3
  }
];

const MarketPage = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [lands, setLands] = useState(INITIAL_LANDS);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtering & Sorting State
  const [selectedRegion, setSelectedRegion] = useState(null); // 'Location' toggle
  const [priceSort, setPriceSort] = useState(null); // 'asc' | 'desc' | null
  const [areaSort, setAreaSort] = useState(null); // 'asc' | 'desc' | null
  
  // Advanced Filter Modal State
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // 'all' | 'verified' | 'unverified'

  // Wallet State
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(2.45);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Modals State
  const [activeDetailLand, setActiveDetailLand] = useState(null);
  const [activeCheckoutLand, setActiveCheckoutLand] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('confirm'); // 'confirm' | 'processing' | 'success'
  const [transactionProgress, setTransactionProgress] = useState(0);
  const [transactionStatusMessage, setTransactionStatusMessage] = useState('');

  // Toast State
  const [toasts, setToasts] = useState([]);

  // --- REFS & SCROLL PARALLAX ---
  const headerRef = useRef(null);
  const filterBarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (filterBarRef.current) {
        const scroll = window.scrollY;
        if (scroll > 100) {
          filterBarRef.current.classList.add('px-4');
          const innerCard = filterBarRef.current.querySelector('.glass-card');
          if (innerCard) innerCard.classList.add('scale-[0.98]');
        } else {
          filterBarRef.current.classList.remove('px-4');
          const innerCard = filterBarRef.current.querySelector('.glass-card');
          if (innerCard) innerCard.classList.remove('scale-[0.98]');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- ACTIONS & SIMULATORS ---
  const triggerToast = (message, type = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleConnectWallet = () => {
    setIsConnectingWallet(true);
    triggerToast('Connecting your MetaMask wallet...', 'info');
    setTimeout(() => {
      setWalletConnected(true);
      setWalletAddress('0x82f0a1e3e920d3f2c5d144888fca02d18492031');
      setWalletBalance(12.45); // Give a good balance for buying
      setIsConnectingWallet(false);
      triggerToast('Wallet connected successfully!', 'success');
    }, 1500);
  };

  const handleDisconnectWallet = () => {
    setShowConfirmModal(true);
  };

  const executeDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletBalance(0);
    setWalletDropdownOpen(false);
    triggerToast('Wallet disconnected', 'info');
  };

  const handleBuyNowClick = (land) => {
    if (!walletConnected) {
      handleConnectWallet();
      return;
    }
    setActiveCheckoutLand(land);
    setCheckoutStep('confirm');
    setTransactionProgress(0);
  };

  const handleConfirmCheckout = () => {
    if (walletBalance < activeCheckoutLand.price) {
      triggerToast('Insufficient funds in wallet!', 'error');
      return;
    }

    setCheckoutStep('processing');
    setTransactionProgress(10);
    setTransactionStatusMessage('Initiating wallet signature request...');

    // Phase 1: Request signature
    setTimeout(() => {
      setTransactionProgress(35);
      setTransactionStatusMessage('Waiting for gas confirmation & block mining...');

      // Phase 2: Mine on blockchain
      setTimeout(() => {
        setTransactionProgress(70);
        setTransactionStatusMessage('Updating Bhoomi registry smart contract...');

        // Phase 3: Update Registry
        setTimeout(() => {
          setTransactionProgress(100);
          setCheckoutStep('success');

          // Process actual changes locally in reactive state
          setLands((prevLands) =>
            prevLands.map((l) =>
              l.id === activeCheckoutLand.id
                ? {
                    ...l,
                    owner: '0x82...031',
                    fullOwner: '0x82f0a1e3e920d3f2c5d144888fca02d18492031',
                    purchased: true,
                  }
                : l
            )
          );

          // Deduct from wallet balance
          const totalCost = activeCheckoutLand.price + 0.0042; // gas
          setWalletBalance((prev) => parseFloat((prev - totalCost).toFixed(4)));

          triggerToast(`Successfully purchased ${activeCheckoutLand.name}!`, 'success');
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // --- FILTER & SORT LOGIC ---
  const resetAdvancedFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setVerifiedFilter('all');
    triggerToast('Filters reset', 'info');
  };

  // Get lands matching active filter criteria
  const filteredLands = lands.filter((land) => {
    // 1. Pagination Check (We dynamically partition lands by page unless filtered/searched)
    const isSearchingOrFiltering =
      searchQuery !== '' ||
      selectedRegion !== null ||
      minPrice !== '' ||
      maxPrice !== '' ||
      minArea !== '' ||
      maxArea !== '' ||
      verifiedFilter !== 'all';

    if (!isSearchingOrFiltering && land.page !== currentPage) {
      return false;
    }

    // 2. Text Search Check
    if (searchQuery !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = land.name.toLowerCase().includes(query);
      const matchId = land.id.toLowerCase().includes(query);
      const matchOwner = land.fullOwner.toLowerCase().includes(query);
      const matchRegion = land.region.toLowerCase().includes(query);
      if (!matchName && !matchId && !matchOwner && !matchRegion) {
        return false;
      }
    }

    // 3. Location / Region Filter (Location Pill)
    if (selectedRegion !== null && land.region !== selectedRegion) {
      return false;
    }

    // 4. Advanced Min Price
    if (minPrice !== '' && land.price < parseFloat(minPrice)) {
      return false;
    }

    // 5. Advanced Max Price
    if (maxPrice !== '' && land.price > parseFloat(maxPrice)) {
      return false;
    }

    // 6. Advanced Min Area
    if (minArea !== '' && land.area < parseInt(minArea, 10)) {
      return false;
    }

    // 7. Advanced Max Area
    if (maxArea !== '' && land.area > parseInt(maxArea, 10)) {
      return false;
    }

    // 8. Advanced Verification
    if (verifiedFilter === 'verified' && !land.verified) {
      return false;
    }
    if (verifiedFilter === 'unverified' && land.verified) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedLands = [...filteredLands].sort((a, b) => {
    if (priceSort) {
      return priceSort === 'asc' ? a.price - b.price : b.price - a.price;
    }
    if (areaSort) {
      return areaSort === 'asc' ? a.area - b.area : b.area - a.area;
    }
    return 0; // default order
  });

  // Cycle Price Sort: Asc -> Desc -> Reset
  const handlePriceSortToggle = () => {
    setAreaSort(null); // clear area sort
    if (priceSort === null) {
      setPriceSort('asc');
      triggerToast('Sorting by price: lowest first', 'info');
    } else if (priceSort === 'asc') {
      setPriceSort('desc');
      triggerToast('Sorting by price: highest first', 'info');
    } else {
      setPriceSort(null);
      triggerToast('Price sorting cleared', 'info');
    }
  };

  // Cycle Area Sort: Asc -> Desc -> Reset
  const handleAreaSortToggle = () => {
    setPriceSort(null); // clear price sort
    if (areaSort === null) {
      setAreaSort('asc');
      triggerToast('Sorting by area: smallest first', 'info');
    } else if (areaSort === 'asc') {
      setAreaSort('desc');
      triggerToast('Sorting by area: largest first', 'info');
    } else {
      setAreaSort(null);
      triggerToast('Area sorting cleared', 'info');
    }
  };

  // Toggle Location Region (cycling heights, valley, plain, coast, core, gardens)
  const regions = ['Heights', 'Valley', 'Plain', 'Coast', 'Core', 'Gardens'];
  const handleLocationToggle = () => {
    if (selectedRegion === null) {
      setSelectedRegion(regions[0]);
      triggerToast(`Filtering region: ${regions[0]}`, 'info');
    } else {
      const currentIndex = regions.indexOf(selectedRegion);
      if (currentIndex === regions.length - 1) {
        setSelectedRegion(null);
        triggerToast('Region filtering cleared', 'info');
      } else {
        const nextRegion = regions[currentIndex + 1];
        setSelectedRegion(nextRegion);
        triggerToast(`Filtering region: ${nextRegion}`, 'info');
      }
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen relative overflow-x-hidden page-enter">
      <style>{styles}</style>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0 opacity-40" />

      {/* --- TOP NAVBAR --- */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-surface/40 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-outline-variant/10">
        <Link to="/" className="font-display text-2xl font-bold tracking-tighter text-primary hover:text-primary-dim transition-colors">
          Bhoomi
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link className="font-headline tracking-wide uppercase text-sm text-primary border-b-2 border-primary pb-1 transition-colors duration-300" to="/marketplace">
            Marketplace
          </Link>
          <a className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-primary-dim transition-colors duration-300" href="#">
            Mint NFT
          </a>
          <Link className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-primary-dim transition-colors duration-300" to="/dashboard">
            Portfolio
          </Link>
          <a className="font-headline tracking-wide uppercase text-sm text-on-surface-variant hover:text-primary-dim transition-colors duration-300" href="#">
            Ledger
          </a>
        </nav>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 items-center">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors" onClick={() => triggerToast('No new notifications', 'info')}>
              notifications
            </span>
            {walletConnected && (
              <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20">
                <span className="material-symbols-outlined text-sm text-primary">account_balance_wallet</span>
                <span className="text-xs font-label font-medium text-primary-dim">{walletBalance} ETH</span>
              </div>
            )}
          </div>
          
          {walletConnected ? (
            <div className="relative">
              <button
                onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                className="bg-gradient-to-br from-primary/20 to-primary-container/20 border border-primary/40 text-primary font-headline text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary/10 transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span>{walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</span>
              </button>
              {walletDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-high border border-outline-variant/20 rounded-md shadow-2xl py-1 z-50 animate-fade-in">
                  <button onClick={handleDisconnectWallet} className="w-full px-4 py-3 text-left text-xs font-headline font-bold text-error hover:bg-error-container/10 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleConnectWallet}
              disabled={isConnectingWallet}
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold px-6 py-2 rounded-full scale-95 active:scale-90 transition-all hover:shadow-[0_0_20px_rgba(143,245,255,0.4)] disabled:opacity-50 btn-shimmer"
            >
              {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {/* --- MAIN PAGE CANVAS --- */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto relative z-10">
        
        {/* --- HERO SECTION --- */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="ledger-pulse-animated w-2 h-2 bg-tertiary rounded-full shadow-[0_0_10px_#e9ffb9]" />
              <span className="font-label text-xs tracking-[0.2em] text-tertiary uppercase">Live Network Registry</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-on-surface">
              Digital Land <br/>
              <span className="text-primary-container">Marketplace</span>
            </h1>
          </div>
          <p className="max-w-md text-on-surface-variant text-lg font-body leading-relaxed">
            Secure your footprint in the decentralized frontier. Explore certified digital land parcels with verified smart contract history.
          </p>
        </div>

        {/* --- FILTER & SEARCH BAR --- */}
        <div ref={filterBarRef} className="sticky top-24 z-40 mb-12 transition-all duration-300">
          <div className="glass-card rounded-xl p-3 flex flex-wrap items-center gap-4 shadow-2xl">
            {/* Search Input */}
            <div className="flex-1 min-w-[300px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-md pl-12 pr-4 py-4 text-on-surface focus:ring-1 focus:ring-primary transition-all placeholder:text-outline-variant outline-none"
                placeholder="Search coordinates, districts, owners, or IDs..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Location Region Pill */}
              <button 
                onClick={handleLocationToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all text-sm font-label uppercase tracking-widest active:scale-95
                  ${selectedRegion 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-surface-container-high border-outline-variant/20 hover:border-primary/50 text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {selectedRegion ? `Region: ${selectedRegion}` : 'Location'}
              </button>

              {/* Price Sort Pill */}
              <button 
                onClick={handlePriceSortToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all text-sm font-label uppercase tracking-widest active:scale-95
                  ${priceSort 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-surface-container-high border-outline-variant/20 hover:border-primary/50 text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                Price {priceSort === 'asc' ? '▲' : priceSort === 'desc' ? '▼' : ''}
              </button>

              {/* Area Sort Pill */}
              <button 
                onClick={handleAreaSortToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all text-sm font-label uppercase tracking-widest active:scale-95
                  ${areaSort 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-surface-container-high border-outline-variant/20 hover:border-primary/50 text-on-surface-variant hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[18px]">square_foot</span>
                Area {areaSort === 'asc' ? '▲' : areaSort === 'desc' ? '▼' : ''}
              </button>

              {/* Advanced Filter Tune */}
              <button 
                onClick={() => setShowAdvancedMenu(true)}
                className={`p-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95
                  ${(minPrice || maxPrice || minArea || maxArea || verifiedFilter !== 'all')
                    ? 'bg-primary text-on-primary shadow-primary/30'
                    : 'bg-primary-container text-on-primary hover:bg-primary shadow-primary/20'}`}
              >
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- ACTIVE FILTER STATUS BAR --- */}
        {(selectedRegion || priceSort || areaSort || minPrice || maxPrice || minArea || maxArea || verifiedFilter !== 'all' || searchQuery) && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/10 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-on-surface-variant font-headline uppercase text-xs tracking-wider">Active Filters:</span>
              
              {searchQuery && (
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-outline-variant/20">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="text-outline-variant hover:text-error">×</button>
                </span>
              )}
              {selectedRegion && (
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-outline-variant/20">
                  Region: {selectedRegion}
                  <button onClick={() => setSelectedRegion(null)} className="text-outline-variant hover:text-error">×</button>
                </span>
              )}
              {priceSort && (
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-outline-variant/20">
                  Price: {priceSort === 'asc' ? 'Lowest First' : 'Highest First'}
                  <button onClick={() => setPriceSort(null)} className="text-outline-variant hover:text-error">×</button>
                </span>
              )}
              {areaSort && (
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-outline-variant/20">
                  Area: {areaSort === 'asc' ? 'Smallest First' : 'Largest First'}
                  <button onClick={() => setAreaSort(null)} className="text-outline-variant hover:text-error">×</button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-outline-variant/20">
                  Price range: {minPrice || '0'} - {maxPrice || '∞'} ETH
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-outline-variant hover:text-error">×</button>
                </span>
              )}
              {(minArea || maxArea) && (
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-outline-variant/20">
                  Area range: {minArea || '0'} - {maxArea || '∞'} SQ. FT.
                  <button onClick={() => { setMinArea(''); setMaxArea(''); }} className="text-outline-variant hover:text-error">×</button>
                </span>
              )}
              {verifiedFilter !== 'all' && (
                <span className="bg-surface-container px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-outline-variant/20">
                  Status: {verifiedFilter}
                  <button onClick={() => setVerifiedFilter('all')} className="text-outline-variant hover:text-error">×</button>
                </span>
              )}
            </div>

            <button 
              onClick={() => {
                setSelectedRegion(null);
                setPriceSort(null);
                setAreaSort(null);
                setSearchQuery('');
                resetAdvancedFilters();
              }}
              className="text-primary hover:text-primary-dim font-headline font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* --- PROPERTY GRID --- */}
        {sortedLands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedLands.map((land) => (
              <div 
                key={land.id}
                className="group relative bg-surface-container-low rounded-lg overflow-hidden transition-all duration-500 hover:-translate-y-2 border border-outline-variant/5 hover:border-primary/20 shadow-lg hover:shadow-2xl hover:shadow-primary/5 hover-glow-border"
              >
                {/* Image & Verified Tag */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={land.image}
                    alt={land.name}
                  />
                  {land.verified && (
                    <div className="absolute top-4 right-4 bg-secondary-container/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg">
                      <span className="material-symbols-outlined text-[14px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <span className="font-label text-[10px] font-bold text-on-secondary-container uppercase tracking-wider">Verified</span>
                    </div>
                  )}
                  {/* Region badge */}
                  <div className="absolute bottom-4 left-4 bg-surface-container-lowest/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-label font-bold text-primary uppercase tracking-widest border border-primary/20">
                    {land.region}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-label text-[10px] text-primary tracking-[0.2em] uppercase mb-1">Plot ID: {land.id}</p>
                      <h3 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors truncate w-48">{land.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-headline text-lg font-bold text-primary-container">{land.price} ETH</p>
                      <p className="font-label text-[10px] text-outline-variant uppercase">~${land.usdPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Attributes Panel */}
                  <div className="flex items-center justify-between text-on-surface-variant font-body text-sm py-4 border-y border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary/60 text-[18px]">person</span>
                      <span className="truncate w-24 hover:text-primary transition-colors cursor-pointer" title={land.fullOwner}>
                        {land.owner}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary/60 text-[18px]">view_in_ar</span>
                      <span>{land.area.toLocaleString()} SQ. FT.</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => navigate(`/property/${land.id}`)}
                      className="flex-1 py-3 px-4 rounded-md border border-outline-variant/30 text-on-surface font-headline text-sm hover:bg-surface-variant transition-colors"
                    >
                      View Details
                    </button>
                    {land.purchased ? (
                      <button 
                        disabled
                        className="flex-1 py-3 px-4 rounded-md bg-surface-container-high text-outline font-headline text-sm font-bold border border-outline-variant/10 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">lock</span>
                        Owned By You
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBuyNowClick(land)}
                        className="flex-1 py-3 px-4 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all hover:scale-[1.02] btn-shimmer"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low/20 rounded-xl border border-outline-variant/10 text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
            <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">No Land Parcels Found</h3>
            <p className="text-on-surface-variant max-w-md font-body mb-6">
              There are no registered land parcels matching your exact criteria. Try removing filters or adjusting your price/area range.
            </p>
            <button 
              onClick={() => {
                setSelectedRegion(null);
                setPriceSort(null);
                setAreaSort(null);
                setSearchQuery('');
                resetAdvancedFilters();
              }}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-headline font-bold transition-all shadow-lg hover:shadow-primary/20"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {searchQuery === '' && !selectedRegion && !minPrice && !maxPrice && !minArea && !maxArea && verifiedFilter === 'all' && (
          <div className="mt-20 flex justify-center items-center gap-4">
            <button 
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:hover:border-outline-variant/20 disabled:hover:text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="flex gap-2">
              {[1, 2, 3].map((page) => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-full font-headline font-bold transition-all
                    ${currentPage === page 
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'hover:bg-surface-container-high hover:text-primary'}`}
                >
                  {page}
                </button>
              ))}
              <span className="w-12 h-12 flex items-center justify-center text-outline-variant">...</span>
              <button 
                onClick={() => {
                  setCurrentPage(24);
                  triggerToast('Loaded simulated archival node page 24', 'info');
                }}
                className={`w-12 h-12 rounded-full hover:bg-surface-container-high transition-colors font-headline
                  ${currentPage === 24 ? 'bg-primary text-on-primary shadow-lg' : ''}`}
              >
                24
              </button>
            </div>

            <button 
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              disabled={currentPage === 3}
              className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:hover:border-outline-variant/20 disabled:hover:text-on-surface-variant"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-outline-variant/15 bg-surface relative z-10">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-headline text-lg text-primary-container font-bold">Bhoomi</div>
          <p className="font-body text-xs text-on-surface-variant">© 2026 Bhoomi Digital Architect. Verified on Ethereum.</p>
        </div>
        <div className="flex gap-8">
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Registry</a>
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">Smart Contracts</a>
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy</a>
          <a className="font-body text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">API</a>
        </div>
        <div className="flex gap-4">
          <div 
            onClick={() => triggerToast('Link copied to clipboard!', 'success')}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </div>
          <Link 
            to="/dashboard"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-[18px]">terminal</span>
          </Link>
        </div>
      </footer>

      {/* --- BOTTOM MOBILE NAVBAR --- */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 md:hidden bg-surface-container-high/60 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-xl border-t border-outline-variant/10">
        <Link className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-xl p-2 transition-all duration-500 ease-out" to="/marketplace">
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Market</span>
        </Link>
        <a className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant transition-all duration-500 ease-out" href="#" onClick={() => triggerToast('Minting interface is opening...', 'info')}>
          <span className="material-symbols-outlined">token</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Mint</span>
        </a>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant transition-all duration-500 ease-out" to="/dashboard">
          <span className="material-symbols-outlined">account_balance</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Assets</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant transition-all duration-500 ease-out" to="/dashboard">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-[10px] tracking-widest uppercase mt-1">Profile</span>
        </Link>
      </nav>


      {/* ======================================================== */}
      {/* ======================== MODALS ======================== */}
      {/* ======================================================== */}

      {/* 1. ADVANCED FILTER MODAL */}
      {showAdvancedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-scaleUp">
            <button 
              onClick={() => setShowAdvancedMenu(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-display text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">tune</span>
              Advanced Registry Filters
            </h3>

            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Price Range (ETH)</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md py-2 px-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                  />
                  <span className="text-outline-variant">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md py-2 px-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Area Range */}
              <div>
                <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Area Range (SQ. FT.)</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    placeholder="Min SQFT"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md py-2 px-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                  />
                  <span className="text-outline-variant">to</span>
                  <input
                    type="number"
                    placeholder="Max SQFT"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-md py-2 px-3 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Verified Filter */}
              <div>
                <label className="block text-xs font-label text-on-surface-variant uppercase tracking-wider mb-2">Smart Contract Verification</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'verified', 'unverified'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setVerifiedFilter(status)}
                      className={`py-2 px-3 rounded text-xs font-headline font-bold uppercase transition-all border
                        ${verifiedFilter === status 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-outline-variant/15">
              <button 
                onClick={resetAdvancedFilters}
                className="flex-1 py-3 px-4 rounded border border-outline-variant/30 text-on-surface font-headline text-xs font-bold hover:bg-surface-variant transition-colors"
              >
                Clear Filters
              </button>
              <button 
                onClick={() => {
                  setShowAdvancedMenu(false);
                  triggerToast('Filters applied successfully!', 'success');
                }}
                className="flex-1 py-3 px-4 rounded bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-xs font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 2. PROPERTY DETAILS VIEW MODAL */}
      {activeDetailLand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl relative animate-scaleUp flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => setActiveDetailLand(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white hover:text-primary flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Hero Image Aspect */}
            <div className="w-full md:w-1/2 aspect-video md:aspect-auto md:h-auto overflow-hidden relative bg-black">
              <img 
                src={activeDetailLand.image} 
                alt={activeDetailLand.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-black/35 pointer-events-none" />
              <div className="absolute bottom-6 left-6">
                <span className="bg-primary/20 backdrop-blur-md text-primary border border-primary/30 px-3 py-1 rounded text-[10px] font-label font-bold uppercase tracking-wider">
                  Region: {activeDetailLand.region}
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-bold mt-2 text-white text-shadow-md">{activeDetailLand.name}</h3>
              </div>
            </div>

            {/* details Info Area */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-outline-variant/15">
                  <div>
                    <p className="text-[10px] font-label text-primary uppercase tracking-[0.2em]">Plot Registry Registry</p>
                    <p className="text-sm font-headline font-bold text-on-surface">{activeDetailLand.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-extrabold text-primary-container">{activeDetailLand.price} ETH</p>
                    <p className="text-xs text-outline-variant uppercase">~${activeDetailLand.usdPrice.toLocaleString()}</p>
                  </div>
                </div>

                {/* Registry Details */}
                <div className="grid grid-cols-2 gap-4 py-4 text-xs font-body border-b border-outline-variant/15">
                  <div>
                    <span className="text-on-surface-variant block mb-1">Contract Address</span>
                    <span className="font-label text-primary truncate block" title="0x742d35Cc6634C0532925a3b844Bc454e4438f44e">
                      0x742d35Cc...38f44e
                    </span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block mb-1">Coordinates</span>
                    <span className="font-label text-on-surface block">{activeDetailLand.coordinates}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block mb-1">Token Standard</span>
                    <span className="font-label text-on-surface block">ERC-721</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block mb-1">Token Identifier</span>
                    <span className="font-label text-on-surface block">{activeDetailLand.id.replace('LV-', '#')}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block mb-1">Current Owner</span>
                    <span className="font-label text-on-surface truncate block" title={activeDetailLand.fullOwner}>
                      {activeDetailLand.owner}
                    </span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block mb-1">Dimension Matrix</span>
                    <span className="font-label text-on-surface block">{activeDetailLand.area.toLocaleString()} SQ. FT.</span>
                  </div>
                </div>

                {/* Ledger History Logs */}
                <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-primary">Blockchain Transaction History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    <div className="flex justify-between items-center p-2 rounded bg-surface/50 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-headline font-bold uppercase text-emerald-400">Minted</span>
                      </div>
                      <span className="text-outline-variant">Block #18,291,093</span>
                      <span className="text-primary-dim">0x0000...0000 → Origin</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-surface/50 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-headline font-bold uppercase text-amber-400">Listed</span>
                      </div>
                      <span className="text-outline-variant">Block #18,349,201</span>
                      <span className="text-primary-dim">{activeDetailLand.owner}</span>
                    </div>
                    {activeDetailLand.purchased && (
                      <div className="flex justify-between items-center p-2 rounded bg-surface/50 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="font-headline font-bold uppercase text-primary">Purchased</span>
                        </div>
                        <span className="text-outline-variant">Block #18,492,031</span>
                        <span className="text-primary-dim">0x82f...a1e</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-4 mt-6 pt-4 border-t border-outline-variant/15">
                <button 
                  onClick={() => setActiveDetailLand(null)}
                  className="flex-1 py-3 px-4 rounded border border-outline-variant/30 text-on-surface font-headline text-xs font-bold hover:bg-surface-variant transition-colors"
                >
                  Close Registry
                </button>
                {activeDetailLand.purchased ? (
                  <button 
                    disabled
                    className="flex-1 py-3 px-4 rounded bg-surface-container-high text-outline font-headline text-xs font-bold border border-outline-variant/10 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Owned
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      const l = activeDetailLand;
                      setActiveDetailLand(null);
                      handleBuyNowClick(l);
                    }}
                    className="flex-1 py-3 px-4 rounded bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-xs font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
                  >
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 3. TRANSACTION CHECKOUT MODAL (WEB3 SIMULATOR) */}
      {activeCheckoutLand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-scaleUp">
            
            {/* Close Button */}
            {checkoutStep !== 'processing' && (
              <button 
                onClick={() => setActiveCheckoutLand(null)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}

            {/* CONFIRM PURCHASE SCREEN */}
            {checkoutStep === 'confirm' && (
              <div>
                <h3 className="font-display text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/15 pb-3">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Simulated Web3 Checkout
                </h3>

                {/* Parcel Summary Card */}
                <div className="flex gap-4 p-4 rounded bg-surface/50 border border-outline-variant/10 mb-6">
                  <img 
                    src={activeCheckoutLand.image} 
                    alt={activeCheckoutLand.name} 
                    className="w-20 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-[10px] text-primary uppercase font-label font-bold tracking-wider">{activeCheckoutLand.id}</p>
                    <p className="font-headline font-bold text-sm text-on-surface">{activeCheckoutLand.name}</p>
                    <p className="text-xs text-on-surface-variant font-body">{activeCheckoutLand.area.toLocaleString()} SQ. FT.</p>
                  </div>
                </div>

                {/* Price Ledger details */}
                <div className="space-y-3 text-xs font-body mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Plot Price</span>
                    <span className="font-label text-on-surface font-bold">{activeCheckoutLand.price} ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant flex items-center gap-1">
                      Gas fee (Estimated)
                      <span className="material-symbols-outlined text-[12px] text-outline cursor-help" title="Decentralized network miners validation processing fee">help</span>
                    </span>
                    <span className="font-label text-on-surface-variant">0.0042 ETH</span>
                  </div>
                  <div className="h-px bg-outline-variant/15" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary font-headline font-bold">Total Payment</span>
                    <span className="font-label text-primary-container font-extrabold">{(activeCheckoutLand.price + 0.0042).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-outline-variant uppercase">
                    <span>In USD</span>
                    <span>~${(activeCheckoutLand.usdPrice + 9.80).toLocaleString()}</span>
                  </div>
                </div>

                {/* Wallet Balance Warning/Summary */}
                <div className="p-3 rounded bg-primary/5 border border-primary/20 flex justify-between items-center text-xs font-body mb-6">
                  <span className="text-on-surface-variant">Connected Wallet Balance:</span>
                  <span className="font-label text-primary font-bold">{walletBalance} ETH</span>
                </div>

                {/* Checkout Trigger */}
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveCheckoutLand(null)}
                    className="flex-grow py-3 px-4 rounded border border-outline-variant/30 text-on-surface font-headline text-xs font-bold hover:bg-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmCheckout}
                    className="flex-grow py-3 px-4 rounded bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-xs font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
                  >
                    Confirm Checkout
                  </button>
                </div>
              </div>
            )}

            {/* PROCESSING TRANSACTION SCREEN */}
            {checkoutStep === 'processing' && (
              <div className="text-center py-8 space-y-6">
                {/* Circular pulsing rings loader */}
                <div className="flex justify-center items-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-primary-container/10" />
                    <div className="absolute inset-2 rounded-full border-2 border-b-primary-container animate-spin duration-1000 reverse-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-primary animate-pulse">database</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-display text-lg font-bold text-primary">Mining Blockchain Transaction...</h4>
                  <p className="text-xs text-on-surface-variant font-body px-6 leading-relaxed">
                    Please do not close your window or disconnect your wallet. The transaction is being secured by decentralized miners.
                  </p>
                </div>

                {/* Progress Bar status */}
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300"
                      style={{ width: `${transactionProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-label text-primary-dim uppercase tracking-wider">{transactionStatusMessage}</p>
                </div>
              </div>
            )}

            {/* TRANSACTION SUCCESS SCREEN */}
            {checkoutStep === 'success' && (
              <div className="text-center py-8 space-y-6 animate-scaleUp">
                {/* Glowing Success Sphere Check */}
                <div className="flex justify-center items-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary flex items-center justify-center shadow-[0_0_30px_rgba(0,238,252,0.3)] animate-pulse-slow">
                    <span className="material-symbols-outlined text-4xl text-primary font-bold">check_circle</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-display text-xl font-bold text-primary">Registry Transaction Complete!</h4>
                  <p className="text-xs text-on-surface-variant font-body px-4">
                    The smart contract registry has successfully updated ownership records. You now legally own this digital real estate parcel!
                  </p>
                </div>

                {/* Success Receipt details */}
                <div className="p-4 rounded bg-surface/50 border border-outline-variant/10 text-left space-y-2 text-[10px] font-body text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Transaction Hash</span>
                    <span className="font-label text-primary-dim cursor-pointer hover:underline" onClick={() => triggerToast('Hash copied!', 'info')}>
                      0x82a5c2d9...3b9e4a
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Identifier</span>
                    <span className="font-label text-on-surface">{activeCheckoutLand.id.replace('LV-', '#')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consensus Layer Status</span>
                    <span className="font-label text-emerald-400 font-bold uppercase">Success (12 Confirmations)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consensus Layer Gas Used</span>
                    <span className="font-label text-on-surface">42,019 Gwei</span>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveCheckoutLand(null)}
                  className="w-full py-3 rounded bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-sm font-bold shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-all active:scale-95"
                >
                  Awesome, Close Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================== TOASTS ======================== */}
      {/* ======================================================== */}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-3 w-80 max-w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-4 rounded-lg shadow-2xl flex items-start gap-3 border animate-slideIn backdrop-blur-md
              ${toast.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
                : toast.type === 'error'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : toast.type === 'info'
                    ? 'bg-surface-container-high/90 border-primary/30 text-primary-dim'
                    : 'bg-surface-container-high/90 border-outline-variant/30 text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5">
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'chat'}
            </span>
            <p className="text-xs font-body font-medium leading-relaxed">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* MetaMask Connection Overlay */}
      {isConnectingWallet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBdIVsUarpd3oBH5AZZuR_4UMzbKWu-M5Zr_KRm5ePRiQsNa1uhNbRt1yH6VwDJarboZpyKfMrhMX2hHCDbPf3rBiPuPensyN4HoE_p1q13VjqwO6Upl5CHLzRtaxY8PnDNibHoucurwcltrPi4GsOykYDYb0HUF7f1boH7IOWv9-1sxyytEuGDqgpeJIg_AB4S-S-vvyT1WY3Bq9cx1GddD8Vy5tWeDxgJcHF-hBfJSbYr4OKn1NsLsfVMl2hZ4uG4wExVXDspwJ4" 
                alt="MetaMask Logo" 
                className="w-16 h-16 object-contain animate-bounce" 
              />
            </div>
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Connecting MetaMask</h3>
              <p className="text-on-surface-variant text-sm mt-2">
                Opening MetaMask extension. Please approve the connection request in the popup window.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              <span>Awaiting connection...</span>
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">link_off</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Disconnect Wallet</h3>
              <p className="text-on-surface-variant text-sm mt-2">
                Are you sure you want to disconnect your MetaMask wallet?
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-outline-variant/20 text-xs font-semibold hover:bg-surface-container-highest transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  executeDisconnectWallet();
                }}
                className="flex-1 py-2.5 rounded-lg bg-error text-on-error text-xs font-semibold hover:bg-error-dim transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPage;
