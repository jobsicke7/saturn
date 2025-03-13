import Image from 'next/image';

export default function Home() {
  return (
    <div 
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Image 
        src="/credit.png" 
        alt="Credit Image"
        layout="responsive"
        width={1920}  // 원본 이미지 가로 크기
        height={1080} // 원본 이미지 세로 크기
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
