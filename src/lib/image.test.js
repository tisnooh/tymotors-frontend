import { optimizedImageUrl, responsiveImageProps } from './image';

const source = 'https://res.cloudinary.com/dwsyixjux/image/upload/v1787842815/tymotors/products/example.png';

test('serves the same TYMotors Cloudinary image in an efficient format and size', () => {
  expect(optimizedImageUrl(source, 480)).toBe(
    'https://res.cloudinary.com/dwsyixjux/image/upload/f_auto,q_auto:best,w_480/v1787842815/tymotors/products/example.png'
  );
  expect(responsiveImageProps(source, [720, 320, 480], '(max-width: 600px) 100vw, 480px')).toEqual({
    src: optimizedImageUrl(source, 720),
    srcSet: [320, 480, 720].map(width => `${optimizedImageUrl(source, width)} ${width}w`).join(', '),
    sizes: '(max-width: 600px) 100vw, 480px',
  });
});

test('does not alter local, third-party, or already optimized photos', () => {
  expect(optimizedImageUrl('/products/reviewed.jpg', 480)).toBe('/products/reviewed.jpg');
  expect(optimizedImageUrl('https://other.example/photo.png', 480)).toBe('https://other.example/photo.png');
  const transformed = optimizedImageUrl(source, 480);
  expect(optimizedImageUrl(transformed, 720)).toBe(transformed);
  expect(responsiveImageProps(transformed, [320, 480], '100vw')).toEqual({ src: transformed });
});
