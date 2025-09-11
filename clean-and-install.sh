#!/bin/bash

echo "🧹 React Native projesini temizliyor..."

# Metro ve Node proceslerini durdur
pkill -f "metro\|react-native\|node.*index\.js" || true

# Node modules ve lock dosyalarını temizle
rm -rf node_modules package-lock.json

# iOS build cache'ini temizle
cd ios
rm -rf Pods Podfile.lock
rm -rf build
cd ..

echo "📦 Bağımlılıkları yeniden yüklüyor..."

# NPM paketlerini yükle
npm install

# iOS pods'ları yükle
cd ios
pod install
cd ..

echo "✅ Temizlik tamamlandı!"
echo "🚀 Projeyi çalıştırmak için:"
echo "   npm start"
echo "   npm run ios"
