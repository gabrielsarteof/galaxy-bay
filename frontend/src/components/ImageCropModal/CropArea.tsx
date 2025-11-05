import ReactCrop, { Crop, PixelCrop, PercentCrop } from 'react-image-crop';
import '@/styles/react-crop-custom.css';
import { ContainerSize } from '@/types/image-crop.types';

interface CropAreaProps {
  imageSrc: string;
  crop: Crop | undefined;
  onCropChange: (crop: Crop | undefined) => void;
  onCropComplete: (pixelCrop: PixelCrop, percentageCrop: PercentCrop) => void;
  aspect: number;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  containerSize: ContainerSize;
  showPreview: boolean;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/**
 * Componente que renderiza a área de crop e preview
 * Gerencia a exibição condicional entre modo crop e preview
 */
export function CropArea({
  imageSrc,
  crop,
  onCropChange,
  onCropComplete,
  aspect,
  imgRef,
  onImageLoad,
  containerSize,
  showPreview,
  previewCanvasRef
}: CropAreaProps) {
  return (
    <div className="flex items-center justify-center px-4 sm:px-8 flex-shrink-0">
      <div
        className="bg-white rounded-xl relative"
        style={{
          width: containerSize.width,
          height: containerSize.height
        }}
      >
        {/* Imagem com crop - escondida quando em preview */}
        <div
          style={{ display: showPreview ? 'none' : 'block' }}
          className="w-full h-full rounded-xl"
        >
          <ReactCrop
            crop={crop}
            onChange={onCropChange}
            onComplete={onCropComplete}
            aspect={aspect}
            minWidth={50}
            minHeight={50}
            keepSelection
            style={{
              width: '100%',
              height: '100%'
            }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop"
              onLoad={onImageLoad}
              className="w-full h-full object-contain"
            />
          </ReactCrop>
        </div>

        {/* Canvas de preview - escondido quando não em preview */}
        <div
          className="w-full h-full flex items-center justify-center rounded-xl bg-white absolute top-0 left-0"
          style={{ display: showPreview ? 'flex' : 'none' }}
        >
          <canvas
            ref={previewCanvasRef}
            style={{
              width: containerSize.width + 'px',
              height: containerSize.height + 'px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
}
